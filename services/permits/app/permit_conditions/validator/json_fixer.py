import io
import json
import logging
import os

import pandas as pd
from app.permit_conditions.pipelines.chat_data import ChatData
from haystack import component
from json_repair import repair_json

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"

@component
class JSONRepair:
    @component.output_types(data=ChatData)
    def run(self, data: ChatData):
        """
        Attempts to repair JSON strings in the messages of a ChatData object.
        The output from Azure OpenAI may not always be a 100% valid JSON string,
        this component attempts to repair the JSON if it is invalid.

        Args:
            data (ChatData): The ChatData object containing the messages to be repaired.

        Returns:
            dict: A dictionary containing the repaired ChatData object.
        """
        # cs = pd.read_csv(io.StringIO(data.messages[0].content), on_bad_lines='warn', dtype=str)

        # jsn = cs.to_json(orient="records")

        # print(jsn)

        # # raise "a"

        # data.messages[0].content = json.dumps({"conditions": json.loads(jsn)})

        docs = {
        }

        for msg in data.documents:
            cont = json.loads(msg.content)
            msg.content = cont
            docs[cont.id] = msg

        for msg in data.messages:
            msg.content = json.loads(repair_json(msg.content))

            for p in msg.content['paragraphs']:
                doc = docs[p['id']]
                doc.meta = {
                    **doc.meta,
                    **p
                }
        logger.info(data.messages)
        raise "hi"

        # for msg in data.messages:
        #     current_section = None
        #     current_paragraph = None
        #     current_subparagraph = None
        #     current_clause = None
        #     current_subclause = None
        #     current_subsubclause = None

        #     cnt = json.loads(msg.content)

        #     sections = []

        #     logger.info(cnt)

        #         # Here you can add logic to handle the conditions as needed
        #         # For example, you might want to store them in a list or process them further
        #     msg['content'] = json.dumps({'conditions': cnt})

        # - id: the id of the condition
        # - type: the type of the condition (section/paragraph/subparagraph/clause/subclause/subsubclause)
        # - numbering: the numbering of the condition (if found)

        # for msg in data.messages:
        #     conditions = []
        #     try:
        #         cnt = json.loads(msg.content)

        #         def dfs(node):
        #             if node == None:
        #                 return
        #             else:
        #                 cond = {
        #                     **node
        #                 }
        #                 del cond['children']
        #                 conditions.append(cond)

        #             for ch in node['children']:
        #                 ch['parent_id'] = node['id']
        #                 dfs(ch)

        #         for c in cnt['conditions']:
        #             dfs(c)
        #         msg.content = json.dumps({'conditions': conditions})
        #     except json.JSONDecodeError as e:
        #         logger.error(f"Failed to decode JSON: {msg.content} - Error: {e}")

        # logger.info(data.messages)
        # raise "hi"
        
        if DEBUG_MODE:
            with open("debug/json_repair_output.txt", "a") as f:
                f.write(json.dumps([json.loads(msg.content) for msg in data.messages], indent=4))

        return {"data": data}
