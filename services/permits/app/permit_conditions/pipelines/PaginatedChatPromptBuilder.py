import logging

from typing import Optional
from haystack.components.builders import ChatPromptBuilder
from haystack import component
from app.permit_conditions.pipelines.chat_data import ChatData

logger = logging.getLogger(__name__)


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
        logger.debug("Creating prompt")

        if iteration:
            # Merge "iteration" variables with the template variables
            # the iteration variable input contain the variables that are specific to the pagination we do
            # (start_page, last_condition_text)
            template_variables = {**template_variables, **iteration}

        output = super(PaginatedChatPromptBuilder, self).run(
            template=template, template_variables=template_variables, **kwargs
        )

        return {"data": ChatData(output["prompt"], kwargs["documents"])}
