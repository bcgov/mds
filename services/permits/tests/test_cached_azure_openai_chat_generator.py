import os
from unittest.mock import MagicMock, patch

import pytest
from app.common.types.chat_data import ChatData
from app.pipelines.permit_condition_extraction.components.CachedAzureOpenAIChatGenerator import (
    CachedAzureOpenAIChatGenerator,
)
from haystack import Document
from haystack.dataclasses import ChatMessage

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
    data = ChatData(messages=[[ChatMessage.from_user("test_message")]], documents=[])
    generation_kwargs = {}
    expected_reply = ChatMessage.from_assistant(
        text="Mocked reply",
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
        assert result["data"].messages[0][0].text == expected_reply.text


def test_run_with_valid_data_multiple_iterations():
    data = ChatData(messages=[[ChatMessage.from_user("test_message")]], documents=[])
    generation_kwargs = {}

    # Test a scenario where the response is too long for GPT4 (stops with reason: length) and require
    # another continuation request to complete the response
    expected_reply = ChatMessage.from_assistant(
        text="Mocked reply",
        meta={
            "usage": {"completion_tokens": 10, "prompt_tokens": 5, "total_tokens": 15},
            "finish_reason": "length",
        },
    )
    expected_reply2 = ChatMessage.from_assistant(
        text="reply continued",
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
        assert chat_response[0].text == "Mocked replyreply continued"

        # and the usage tokens should be summed up
        assert chat_response[0].meta["usage"]["total_tokens"] == 18
        assert chat_response[0].meta["usage"]["completion_tokens"] == 11
        assert chat_response[0].meta["usage"]["prompt_tokens"] == 7

        # Make sure the second iteration contained the reply from the first iteration
        # and a command to continue the generation
        mock_fetch_result.assert_called_with(
            data.messages[0]
            + [
                expected_reply,
                ChatMessage.from_user(
                    "Your response got cut off. Continue from where you left off."
                ),
            ],
            {},
        )


def test_fetch_result_with_cache_hit():
    with patch.dict(
        "os.environ",
        {
            "DEBUG_MODE": "false",
            "ELASTICSEARCH_CA_CERT": "mock_ca_cert",
            "ELASTICSEARCH_HOST": "mock_host",
            "ELASTICSEARCH_USERNAME": "mock_username",
            "ELASTICSEARCH_PASSWORD": "mock_password",
        },
    ):
        with patch(
            "app.pipelines.permit_condition_extraction.components.CachedAzureOpenAIChatGenerator.hash_messages",
            return_value="mock_cache_key",
        ) as mock_hash_messages:
            mock_document = MagicMock(spec=Document)
            mock_document.content = "mock_content"
            mock_document.meta = {
                "name": None,
                "role": "assistant",
                "model": "gpt-3.5-turbo",
                "index": "mock_index",
                "finish_reason": "stop",
                "usage": {
                    "completion_tokens": 10,
                    "prompt_tokens": 5,
                    "total_tokens": 15,
                },
            }

            expected_reply = ChatMessage.from_assistant(
                text=mock_document.content,
                meta=mock_document.meta,
            )

            with patch(
                "app.pipelines.permit_condition_extraction.components.CachedAzureOpenAIChatGenerator.ElasticsearchDocumentStore"
            ) as MockElasticsearchDocumentStore:
                with patch(
                    "app.pipelines.permit_condition_extraction.components.CachedAzureOpenAIChatGenerator.CacheChecker"
                ) as MockCacheChecker:
                    mock_cache_checker_instance = MockCacheChecker.return_value
                    mock_cache_checker_instance.run.return_value = {
                        "hits": [mock_document]
                    }

                    generator = CachedAzureOpenAIChatGenerator()

                    result = generator.fetch_result(messages=[], generation_kwargs={})

                    mock_hash_messages.assert_called_once()
                    mock_cache_checker_instance.run.assert_called_once_with(
                        items=["mock_cache_key"]
                    )
                    assert result is not None
                    assert result.text == expected_reply.text
                    assert result.name == expected_reply.name
                    assert result.role == expected_reply.role
                    assert result.meta == expected_reply.meta

                    MockElasticsearchDocumentStore.assert_called_once()


def test_run_with_multiple_message_groups_calls_gpt_for_both():
    messages1 = [ChatMessage.from_user("test_message_1")]
    messages2 = [ChatMessage.from_user("test_message_2")]
    data = ChatData(messages=[messages1, messages2], documents=[])
    generation_kwargs = {}

    expected_reply1 = ChatMessage.from_assistant(
        text="Mocked reply 1",
        meta={
            "usage": {"completion_tokens": 10, "prompt_tokens": 5, "total_tokens": 15},
            "finish_reason": "stop",
        },
    )

    expected_reply2 = ChatMessage.from_assistant(
        text="Mocked reply 2",
        meta={
            "usage": {"completion_tokens": 8, "prompt_tokens": 4, "total_tokens": 12},
            "finish_reason": "stop",
        },
    )

    with patch.object(
        CachedAzureOpenAIChatGenerator,
        "fetch_result",
        side_effect=[expected_reply1, expected_reply2],
    ):
        generator = CachedAzureOpenAIChatGenerator()
        result = generator.run(data, generation_kwargs)

        assert len(result["data"].messages) == 2
        assert result["data"].messages[0][0].text == expected_reply1.text
        assert result["data"].messages[1][0].text == expected_reply2.text
