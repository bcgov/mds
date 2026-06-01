import time
from base64 import b64encode
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Callable, List, Optional

from app.pipelines.document_search.artifact_chunk_builder import (
    clean_text,
    normalize_generated_category,
    parse_json_object,
    truncate_summary,
)


def enrich_figure_artifacts(
    figure_artifacts: List[dict],
    *,
    multimodal_enrichment_enabled: bool,
    multimodal_summary_max_chars: int,
    max_workers: int,
    categorize_artifact_fn: Callable,
    generate_figure_caption_and_summary_fn: Callable,
    logger,
) -> None:
    if not figure_artifacts:
        return

    if not multimodal_enrichment_enabled:
        for artifact in figure_artifacts:
            content = artifact.get('content') or {}
            caption = content.get('caption')
            if caption:
                content['caption_source'] = 'di'
            content['category'] = categorize_artifact_fn(
                artifact_type='figure',
                caption=clean_text(content.get('caption')),
                description=clean_text(content.get('description')),
                summary=clean_text(content.get('summary')),
                footnotes=content.get('footnotes') or [],
            )
            artifact['content'] = content
        return

    totals = {
        'processed': 0,
        'di_caption_missing': 0,
        'generated_caption': 0,
        'generated_summary': 0,
        'failed': 0,
    }
    total_latency_s = 0.0

    enrichment_requests = []
    for artifact in figure_artifacts:
        content = artifact.get('content') or {}
        caption = clean_text(content.get('caption'))
        description = clean_text(content.get('description'))
        footnotes = content.get('footnotes') or []

        totals['processed'] += 1
        if not caption:
            totals['di_caption_missing'] += 1

        enrichment_requests.append(
            {
                'artifact': artifact,
                'content': content,
                'caption': caption,
                'description': description,
                'footnotes': footnotes,
            }
        )

    worker_count = min(max_workers, len(enrichment_requests))
    if worker_count <= 0:
        return

    with ThreadPoolExecutor(max_workers=worker_count) as executor:
        future_to_request = {}
        for request in enrichment_requests:
            request['start_time'] = time.perf_counter()
            future = executor.submit(
                generate_figure_caption_and_summary_fn,
                image_payload=request['artifact'].get('_artifact_upload'),
                page_number=request['artifact'].get('page_number'),
                description=request['description'],
                footnotes=request['footnotes'],
            )
            future_to_request[future] = request

        for future in as_completed(future_to_request):
            request = future_to_request[future]
            artifact = request['artifact']
            content = request['content']
            caption = request['caption']

            try:
                generated = future.result()
                total_latency_s += time.perf_counter() - request['start_time']

                generated_caption = clean_text(generated.get('caption'))
                generated_summary = clean_text(generated.get('summary'))
                generated_category = normalize_generated_category(generated.get('category'))

                if caption:
                    content['caption'] = caption
                    content['caption_source'] = 'di'
                elif generated_caption:
                    content['caption'] = generated_caption
                    content['caption_source'] = 'generated'
                    totals['generated_caption'] += 1

                if generated_summary:
                    content['summary'] = truncate_summary(generated_summary, multimodal_summary_max_chars)
                    content['summary_source'] = 'generated'
                    totals['generated_summary'] += 1

                if generated_category:
                    content['category'] = generated_category
            except Exception as exc:  # noqa: BLE001 - enrichment must be non-blocking
                totals['failed'] += 1
                logger.warning(
                    'Figure enrichment failed for artifact_id=%s: %s',
                    artifact.get('artifact_id'),
                    exc,
                )
                if caption:
                    content['caption'] = caption
                    content['caption_source'] = 'di'

            if not content.get('category'):
                content['category'] = categorize_artifact_fn(
                    artifact_type='figure',
                    caption=clean_text(content.get('caption')),
                    description=clean_text(content.get('description')),
                    summary=clean_text(content.get('summary')),
                    footnotes=content.get('footnotes') or [],
                )

            artifact['content'] = content

    avg_latency_ms = int((total_latency_s / totals['processed']) * 1000) if totals['processed'] else 0
    logger.info(
        'Figure enrichment stats: processed=%d di_caption_missing=%d generated_caption=%d generated_summary=%d failed=%d avg_latency_ms=%d',
        totals['processed'],
        totals['di_caption_missing'],
        totals['generated_caption'],
        totals['generated_summary'],
        totals['failed'],
        avg_latency_ms,
    )


def generate_figure_caption_and_summary(
    image_payload: Optional[dict],
    page_number: Optional[int],
    description: Optional[str],
    footnotes: List[str],
    *,
    openai_client,
    config,
) -> dict:
    summary_limit = max(80, config.multimodal_summary_max_chars)
    user_context_parts = []
    if page_number:
        user_context_parts.append(f'Page number: {page_number}')
    if description:
        user_context_parts.append(f'Document text near figure: {description}')
    if footnotes:
        user_context_parts.append(f"Figure footnotes: {' | '.join(str(note) for note in footnotes if note)}")

    context_text = '\n'.join(user_context_parts) if user_context_parts else 'No additional context available.'

    prompt_text = (
        'Generate JSON only with keys caption, summary, and category. '
        'Do not add any other keys. Do not include markdown.\n\n'
        'General rules:\n'
        '- Ground all statements in visible evidence and provided context.\n'
        '- No speculation, legal conclusions, or inferred intent.\n'
        '- If uncertain, omit uncertain details and use empty string when needed.\n\n'
        'Caption rules:\n'
        '- Exactly one sentence, max 20 words, concrete and visual.\n'
        '- Prefer nouns over adjectives; avoid generic filler.\n'
        '- Include image type only when visible (map, photo, diagram, chart, table image, technical drawing).\n\n'
        '- If the figure contains a readable embedded title/type label, include the most specific one in the caption.\n\n'
        'Caption rules by image type:\n'
        '- Map: name map subject and 1-2 visible elements (for example pit boundary, haul roads, watercourse, labels, legend, north arrow, scale bar). Include readable map-type text (for example site map, location map, orthophoto) when present. Use place names or coordinates only if readable.\n'
        '- Scenery photo: name scene type and dominant visible features (for example terrain, vegetation, roads, equipment, facilities, disturbed ground). Mention viewpoint only if obvious.\n'
        '- Other: for diagram/chart/table image/technical drawing, state figure type and primary visible components, variables, or labeled elements. Include readable figure-type labels (for example cross-section, plan view, workflow) when present.\n\n'
        'Summary rules for search:\n'
        f'- Max {summary_limit} characters, 1-3 concise sentences, search-friendly.\n'
        '- Include high-value searchable terms visible in the image and context (site features, mining infrastructure, activity type, environmental features, labels, units).\n'
        '- Keep concise; no narrative.\n\n'
        'Category rules:\n'
        '- Choose exactly one category from this list: map, site_photo, cross_section, plan_view, diagram, chart_graph, technical_drawing, other.\n'
        '- Prefer map/site_photo when clearly visible; use other only when none fit.\n\n'
        'Suggested process: classify image as map, scenery photo, or other; then apply the corresponding caption rule.\n\n'
        f'{context_text}'
    )

    user_content: List[dict[str, Any]] = [{'type': 'text', 'text': prompt_text}]
    if image_payload and image_payload.get('content_bytes'):
        image_b64 = b64encode(image_payload['content_bytes']).decode('ascii')
        user_content.append(
            {
                'type': 'image_url',
                'image_url': {'url': f'data:image/png;base64,{image_b64}'},
            }
        )

    messages: List[dict[str, Any]] = [
        {
            'role': 'system',
            'content': 'Return strict JSON with keys caption, summary, and category only. Output must be valid JSON.',
        },
        {'role': 'user', 'content': user_content},
    ]

    response = openai_client.chat.completions.create(
        model=config.openai.deployment_name,
        temperature=0,
        response_format={'type': 'json_object'},
        messages=messages,  # type: ignore[arg-type]
    )

    content_text = ((response.choices or [])[0].message.content or '').strip()
    payload = parse_json_object(content_text)
    if not isinstance(payload, dict):
        return {'caption': '', 'summary': '', 'category': ''}

    return {
        'caption': clean_text(payload.get('caption')) or '',
        'summary': clean_text(payload.get('summary')) or '',
        'category': normalize_generated_category(payload.get('category')) or '',
    }
