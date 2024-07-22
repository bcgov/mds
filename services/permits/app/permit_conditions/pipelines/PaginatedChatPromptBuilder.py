import logging
from typing import Optional

from app.permit_conditions.pipelines.chat_data import ChatData
from haystack import component
from haystack.components.builders import ChatPromptBuilder

logger = logging.getLogger(__name__)
DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"


@component
class PaginatedChatPromptBuilder(ChatPromptBuilder):
    """
    Component that renders chat prompts using Jinja templates for the use
    in further steps of the pipeline.

    This component extends the ChatPromptBuilder component to support pagination of the chat prompts
    """

    @component.output_types(data=ChatData)
    def run(
        self,
        iteration: Optional[dict] = None,
        template=None,
        template_variables=None,
        **kwargs,
    ):

        if iteration:
            # Merge "iteration" variables with the template variables
            # the iteration variable input contain the variables that are specific to the pagination we do
            # (start_page, last_condition_text)
            template_variables = {**template_variables, **iteration}

        output = super(PaginatedChatPromptBuilder, self).run(
            template=template, template_variables=template_variables, **kwargs
        )

        if DEBUG_MODE:
            with open("debug/paginated_chat_prompt_builder_output.txt", "a") as f:
                for prompt in output["prompt"]:
                    f.write(prompt.content + "\n\n")
        return {"data": ChatData(output["prompt"], kwargs["documents"])}
