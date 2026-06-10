from pathlib import Path
from typing import Any, List

from app.pipelines.document_search.artifact_chunk_builder import (
    build_artifact_search_chunks,
)
from app.pipelines.document_search.artifact_enrichment import (
    enrich_figure_artifacts,
)
from app.pipelines.document_search.artifact_extraction import (
    extract_figure_artifacts,
    extract_table_artifacts,
)
from app.pipelines.document_search.artifact_region_image import (
    extract_page_rotation_hints,
)
from app.pipelines.document_search.components.document_chunker import (
    DocumentChunkMetadata,
)
from haystack import Pipeline, component


@component
class MetadataBuilderComponent:
    @component.output_types(chunk_metadata=DocumentChunkMetadata)
    def run(self, now_application_guid: str, doc_meta: dict):
        return {
            "chunk_metadata": DocumentChunkMetadata(
                now_application_guid=now_application_guid,
                mine_guid=doc_meta.get("mine_guid", ""),
                document_manager_guid=doc_meta.get("document_manager_guid", ""),
                document_name=doc_meta.get("document_name", ""),
                document_type=doc_meta.get("document_type", ""),
                submitted_date=doc_meta.get("submitted_date"),
            )
        }


@component
class AnalyzeDocumentComponent:
    @component.output_types(analyze_result=Any, paragraph_documents=List[Any])
    def run(self, tmp_path: str):
        from app.pipelines.document_search.indexing import document_intelligence

        analyze_result = document_intelligence.run_document_intelligence(Path(tmp_path))
        paragraph_documents = [
            document_intelligence.add_metadata_to_document(idx, paragraph)
            for idx, paragraph in enumerate(analyze_result.paragraphs or [])
        ]
        return {
            "analyze_result": analyze_result,
            "paragraph_documents": paragraph_documents,
        }


@component
class TextChunkComponent:
    @component.output_types(text_chunks=List[dict])
    def run(self, paragraph_documents: List[Any], chunk_metadata: DocumentChunkMetadata):
        from app.pipelines.document_search.indexing import chunker

        result = chunker.run(paragraph_documents, chunk_metadata)
        return {"text_chunks": result["chunks"]}


@component
class ArtifactExtractionComponent:
    @component.output_types(table_artifacts=List[dict], figure_artifacts=List[dict])
    def run(self, analyze_result: Any, doc_meta: dict, tmp_path: str):
        page_rotation_hints = extract_page_rotation_hints(analyze_result)
        table_artifacts = extract_table_artifacts(
            analyze_result,
            doc_meta,
            tmp_path,
            page_rotation_hints,
        )
        figure_artifacts = extract_figure_artifacts(
            analyze_result,
            doc_meta,
            tmp_path,
            page_rotation_hints,
        )
        return {
            "table_artifacts": table_artifacts,
            "figure_artifacts": figure_artifacts,
        }


@component
class FigureEnrichmentComponent:
    @component.output_types(figure_artifacts=List[dict])
    def run(self, figure_artifacts: List[dict]):
        from app.pipelines.document_search.indexing import (
            openai_client,
        )

        enrich_figure_artifacts(
            figure_artifacts,
            openai_client=openai_client,
        )
        return {"figure_artifacts": figure_artifacts}


@component
class ArtifactChunkBuilderComponent:
    @component.output_types(artifacts=List[dict], artifact_chunks=List[dict])
    def run(
        self,
        table_artifacts: List[dict],
        figure_artifacts: List[dict],
        chunk_metadata: DocumentChunkMetadata,
    ):
        artifacts = table_artifacts + figure_artifacts
        artifact_chunks = build_artifact_search_chunks(artifacts, chunk_metadata)
        return {
            "artifacts": artifacts,
            "artifact_chunks": artifact_chunks,
        }


@component
class ChunkMergeComponent:
    @component.output_types(chunks=list, artifacts=list)
    def run(self, text_chunks: List[dict], artifact_chunks: List[dict], artifacts: List[dict]):
        return {
            "chunks": text_chunks + artifact_chunks,
            "artifacts": artifacts,
        }


def create_document_indexing_pipeline(
) -> Pipeline:
    pipeline = Pipeline()

    pipeline.add_component("metadata_builder", MetadataBuilderComponent())
    pipeline.add_component("analyzer", AnalyzeDocumentComponent())
    pipeline.add_component("text_chunker", TextChunkComponent())
    pipeline.add_component("artifact_extractor", ArtifactExtractionComponent())
    pipeline.add_component("figure_enricher", FigureEnrichmentComponent())
    pipeline.add_component("artifact_chunk_builder", ArtifactChunkBuilderComponent())
    pipeline.add_component("chunk_merger", ChunkMergeComponent())

    pipeline.connect("metadata_builder.chunk_metadata", "text_chunker.chunk_metadata")
    pipeline.connect("metadata_builder.chunk_metadata", "artifact_chunk_builder.chunk_metadata")
    pipeline.connect("analyzer.paragraph_documents", "text_chunker.paragraph_documents")
    pipeline.connect("analyzer.analyze_result", "artifact_extractor.analyze_result")
    pipeline.connect("artifact_extractor.figure_artifacts", "figure_enricher.figure_artifacts")
    pipeline.connect("artifact_extractor.table_artifacts", "artifact_chunk_builder.table_artifacts")
    pipeline.connect("figure_enricher.figure_artifacts", "artifact_chunk_builder.figure_artifacts")
    pipeline.connect("text_chunker.text_chunks", "chunk_merger.text_chunks")
    pipeline.connect("artifact_chunk_builder.artifact_chunks", "chunk_merger.artifact_chunks")
    pipeline.connect("artifact_chunk_builder.artifacts", "chunk_merger.artifacts")

    return pipeline
