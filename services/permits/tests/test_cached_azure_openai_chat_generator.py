import os
import pickle
from unittest.mock import MagicMock, mock_open, patch

import pytest
from haystack import Document

from app.permit_conditions.pipelines.CachedAzureOpenAIChatGenerator import (
    CachedAzureOpenAIChatGenerator,
)
from app.permit_conditions.pipelines.chat_data import ChatData
from haystack.dataclasses import ChatMessage
from haystack.components.caching import CacheChecker


logger = MagicMock()


@pytest.fixture(scope="session", autouse=True)
def set_env():
    os.environ["FLAG"] = "1"


from unittest.mock import patch

patch.dict(
    os.environ,
    {"AZURE_OPENAI_ENDPOINT": "http://test.test", "AZURE_OPENAI_API_KEY": "test"},
).start()


def test_run_with_valid_data():
    data = ChatData(messages=[ChatMessage.from_user("test_message")], documents=[])
    generation_kwargs = {}
    expected_reply = ChatMessage(
        content="Mocked reply",
        role="assistant",
        name=None,
        meta={
            "usage": {"completion_tokens": 10, "prompt_tokens": 5, "total_tokens": 15},
            "finish_reason": "stop",
        },
    )

    with patch.object(
        CachedAzureOpenAIChatGenerator, "fetch_result", return_value=expected_reply
    ):
        generator = CachedAzureOpenAIChatGenerator()

        result = generator.run(data, generation_kwargs)
        assert result["data"].messages[0].content == expected_reply.content


def test_run_with_valid_data_multiple_iterations():
    data = ChatData(messages=[ChatMessage.from_user("test_message")], documents=[])
    generation_kwargs = {}

    # Test a scenario where the response is too long for GPT4 (stops with reason: length) and require
    # another continuation request to complete the response
    expected_reply = ChatMessage(
        content="Mocked reply",
        role="assistant",
        name=None,
        meta={
            "usage": {"completion_tokens": 10, "prompt_tokens": 5, "total_tokens": 15},
            "finish_reason": "length",
        },
    )
    expected_reply2 = ChatMessage(
        content="reply continued",
        role="assistant",
        name=None,
        meta={
            "usage": {"completion_tokens": 1, "prompt_tokens": 2, "total_tokens": 3},
            "finish_reason": "stop",
        },
    )

    with patch.object(
        CachedAzureOpenAIChatGenerator,
        "fetch_result",
        side_effect=[expected_reply, expected_reply2],
    ) as mock_fetch_result:
        generator = CachedAzureOpenAIChatGenerator()

        result = generator.run(data, generation_kwargs)

        assert len(result["data"].messages) == 1
        chat_response = result["data"].messages[0]

        # Response for each continuation request should be concatinated
        assert chat_response.content == "Mocked replyreply continued"

        # and the usage tokens should be summed up
        assert chat_response.meta["usage"]["total_tokens"] == 18
        assert chat_response.meta["usage"]["completion_tokens"] == 11
        assert chat_response.meta["usage"]["prompt_tokens"] == 7

        # Make sure the second iteration contained the reply from the first iteration
        # and a command to continue the generation
        mock_fetch_result.assert_called_with(
            data.messages + [expected_reply, ChatMessage.from_user("Continue!")], {}
        )


def test_fetch_result_with_cache_hit():
    mock_document = MagicMock(spec=Document)
    mock_document.content = "Cached reply"
    mock_document.meta = {
        "name": "ChatBot",
        "role": "assistant",
        "model": "gpt-3.5",
        "index": "permits",
        "finish_reason": "complete",
        "usage": {
            "completion_tokens": 10,
            "prompt_tokens": 5,
            "total_tokens": 15
        }
    }

    mock_cache_checker = MagicMock(spec=CacheChecker)
    mock_cache_checker.run.return_value = {
        "hits": [mock_document]
    }

    with patch.object(
            CachedAzureOpenAIChatGenerator,
            'fetch_result',
            return_value=mock_document
    ) as mock_fetch_result, \
            patch(
                'app.permit_conditions.pipelines.CachedAzureOpenAIChatGenerator.ElasticsearchDocumentStore') as MockElasticsearchDocumentStore, \
            patch('app.permit_conditions.pipelines.CachedAzureOpenAIChatGenerator.CacheChecker',
                  return_value=mock_cache_checker), \
            patch('app.permit_conditions.pipelines.CachedAzureOpenAIChatGenerator.Document',
                  return_value=mock_document), \
            patch('app.permit_conditions.pipelines.CachedAzureOpenAIChatGenerator.ChatMessage',
                  return_value=ChatMessage(content="Cached reply", role="assistant", name=None,
                                           meta=mock_document.meta)):

        generator = CachedAzureOpenAIChatGenerator()

        messages = [ChatMessage(content="test_message", role="user", name=None, meta={})]
        generation_kwargs = {}

        result = generator.run(ChatData(messages=messages, documents=[]), generation_kwargs)

        assert len(result["data"].messages) == 1
        chat_response = result["data"].messages[0]

        assert chat_response.content == "Cached reply"
        assert chat_response.meta["name"] == "ChatBot"
        assert chat_response.meta["role"] == "assistant"
        assert chat_response.meta["usage"]["total_tokens"] == 15
        assert chat_response.meta["usage"]["completion_tokens"] == 10
        assert chat_response.meta["usage"]["prompt_tokens"] == 5

        mock_fetch_result.assert_called_once_with(messages, generation_kwargs)
        MockElasticsearchDocumentStore.assert_not_called()
