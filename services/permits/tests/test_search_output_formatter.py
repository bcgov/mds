from app.pipelines.permit_condition_search.components.search_output_formatter import (
    SearchOutputFormatter,
)
from haystack import Document, Pipeline
from haystack.dataclasses import ChatMessage


def test_search_output_formatter():
    formatter = SearchOutputFormatter()
    documents = [Document(content="test doc")]
    replies = [ChatMessage.from_user(text="test reply")]

    result = formatter.run(documents=documents, replies=replies)

    assert len(result["documents"]) == 1
    assert len(result["replies"]) == 1
    assert result["documents"][0].content == "test doc"
    assert result["replies"][0].text == "test reply"

def test_search_output_formatter_empty():
    formatter = SearchOutputFormatter()
    documents = []
    replies = []

    result = formatter.run(documents=documents, replies=replies)

    assert len(result["documents"]) == 0
    assert len(result["replies"]) == 0


def test_search_output_formatter_in_pipeline():

    formatter = SearchOutputFormatter()
    pipeline = Pipeline()
    pipeline.add_component("formatter", formatter)
    
    documents = [Document(content="test doc")]
    replies = [ChatMessage.from_user(text="test reply")]
    
    result = pipeline.run({
        "formatter": {
            "documents": documents,
            "replies": replies
        }
    })

    assert len(result["formatter"]["documents"]) == 1
    assert len(result["formatter"]["replies"]) == 1
    assert result["formatter"]["documents"][0].content == "test doc"
    assert result["formatter"]["replies"][0].text == "test reply"