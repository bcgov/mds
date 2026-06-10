import logging
import time
from base64 import b64encode
from concurrent.futures import Future, ThreadPoolExecutor, as_completed
from functools import lru_cache
from pathlib import Path
from typing import Any, List, Optional

from app.pipelines.document_search.artifact_chunk_builder import (
    clean_text,
    normalize_generated_category,
    parse_json_object,
    truncate_summary,
)
from app.pipelines.document_search.config import config

PROMPT_TEMPLATE_PATH = Path(__file__).with_name('artifact_enrichment_prompt.txt')
logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _load_prompt_template() -> str:
    return PROMPT_TEMPLATE_PATH.read_text(encoding='utf-8')


def _build_prompt_text(*, summary_limit: int, context_text: str) -> str:
    return _load_prompt_template().format(
        summary_limit=summary_limit,
        context_text=context_text,
    )


def _submit_enrichment_requests(*, executor, enrichment_requests: List[dict], openai_client) -> dict:
    future_to_request: dict[Future, dict] = {}
    for request in enrichment_requests:
        request['start_time'] = time.perf_counter()
        future = executor.submit(
            generate_figure_caption_and_summary,
            image_payload=request['artifact'].get('_artifact_upload'),
            page_number=request['artifact'].get('page_number'),
            description=request['description'],
            footnotes=request['footnotes'],
            openai_client=openai_client,
        )
        future_to_request[future] = request
    return future_to_request


def _apply_generated_artifact_content(
    *,
    content: dict,
    caption: Optional[str],
    generated: dict,
    multimodal_summary_max_chars: int,
    totals: dict,
) -> None:
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


def _handle_enrichment_failure(*, artifact: dict, caption: Optional[str], content: dict, totals: dict, exc: Exception):
    totals['failed'] += 1
    logger.warning(
        'Figure enrichment failed for artifact_id=%s: %s',
        artifact.get('artifact_id'),
        exc,
    )
    if caption:
        content['caption'] = caption
        content['caption_source'] = 'di'


def enrich_figure_artifacts(
    figure_artifacts: List[dict],
    *,
    openai_client,
) -> None:
    """Enrich figure artifacts with generated caption, summary, and category metadata.

    Keeps DI captions when present, generates missing metadata via multimodal model calls,
    and treats enrichment failures as non-blocking so indexing can continue.
    """
    if not figure_artifacts:
        return

    if not config.multimodal_enrichment_enabled:
        for artifact in figure_artifacts:
            content = artifact.get('content') or {}
            caption = content.get('caption')
            if caption:
                content['caption_source'] = 'di'
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

    worker_count = min(config.multimodal_prompt_max_workers, len(enrichment_requests))
    if worker_count <= 0:
        return

    with ThreadPoolExecutor(max_workers=worker_count) as executor:
        future_to_request = _submit_enrichment_requests(
            executor=executor,
            enrichment_requests=enrichment_requests,
            openai_client=openai_client,
        )

        for future in as_completed(future_to_request):
            request = future_to_request[future]
            artifact = request['artifact']
            content = request['content']
            caption = request['caption']

            try:
                generated = future.result()
                total_latency_s += time.perf_counter() - request['start_time']
                _apply_generated_artifact_content(
                    content=content,
                    caption=caption,
                    generated=generated,
                    multimodal_summary_max_chars=config.multimodal_summary_max_chars,
                    totals=totals,
                )
            except Exception as exc:  # noqa: BLE001 - enrichment must be non-blocking
                _handle_enrichment_failure(
                    artifact=artifact,
                    caption=caption,
                    content=content,
                    totals=totals,
                    exc=exc,
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

    prompt_text = _build_prompt_text(summary_limit=summary_limit, context_text=context_text)

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
