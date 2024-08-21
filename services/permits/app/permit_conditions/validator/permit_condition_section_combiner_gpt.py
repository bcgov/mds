import json
import logging
import operator
import os
import re
from functools import reduce
from typing import List, Optional

from app.permit_conditions.pipelines.chat_data import ChatData
from app.permit_conditions.validator.parse_hierarchy import parse_hierarchy
from app.permit_conditions.validator.permit_condition_model import (
    ConditionType,
    PermitCondition,
    PermitConditions,
    PromptResponse,
    RootPromptResponse,
)
from haystack import Document, component
from haystack.components.preprocessors import DocumentCleaner
from haystack.dataclasses import ChatMessage
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"

def _clean(text) -> str:
    if not text:
        return ''
    if isinstance(text, str):
        cont = text.replace(".", "").replace("(", "").replace(")", "").replace(" ", "").strip()
        cleaner = DocumentCleaner(
        ascii_only=True,
            remove_empty_lines=True,
            remove_extra_whitespaces=True,
            remove_repeated_substrings=False)
        
        doc = cleaner.clean(Document(content=cont))

        return doc.content

    else:
        return str(text)

class ExtractionIteration(BaseModel):
    start_page: int
    last_condition_text: str


@component
class PermitConditionSectionCombinerGpt:

    def __init__(self):
        # The maximum number of pages to process in a single iteration
        self.max_pages = 6

        # The number of the first page to start processing
        self.start_page = 0
        # self.documents: List[PermitCondition] = []
        self.meta = None

        # The content of the last condition that was processed
        self.last_condition_text = None

    @component.output_types(
        documents=Optional[List[PromptResponse]], iteration=Optional[dict]
    )
    def run(self, data: ChatData):
        """
        Validate the extracted permit conditions, output information about the next pages
        that needs processing if the current iteration is not the last one, otherwise return
        the conditions found.
        """
        content = []

        content = [
            {
                **json.loads(doc.content),
                "meta": doc.meta
            } for doc in data.documents[1:]
        ]

        for msg in data.messages:
            cnt = json.loads(msg.content)
            for p in cnt['conditions']:
                mtch = next((x for x in content if x['id'] == p.get('id')), None)

                if mtch:
                    mtch['parent_id'] = p.get('parent_id')
                    mtch['numbering'] = p.get('numbering')

                    if mtch['numbering']:
                        mtch['numbering'] = re.sub(r'\W+', '', p['numbering']) 
                        mtch['text'] = mtch['text'].lstrip(p['numbering']).lstrip('.').strip()

        def flatten(root):

            flattened_conditions = []

            def dfs(node, level=0, numbering_dict = {}):
                if not numbering_dict:
                    numbering_dict = {}
                if node == None:
                    return
                if level == 1:
                    numbering_dict['section_number'] = node['numbering']
                    numbering_dict['paragraph_number'] = None
                    numbering_dict['subparagraph_number'] = None
                    numbering_dict['clause_number'] = None
                    numbering_dict['subclause_number'] = None
                    numbering_dict['subsubclause_number'] = None
                elif level == 2:
                    numbering_dict['paragraph_number'] = node['numbering']
                    numbering_dict['subparagraph_number'] = None
                    numbering_dict['clause_number'] = None
                    numbering_dict['subclause_number'] = None
                    numbering_dict['subsubclause_number'] = None
                elif level == 3:
                    numbering_dict['subparagraph_number'] = node['numbering']
                    numbering_dict['clause_number'] = None
                    numbering_dict['subclause_number'] = None
                    numbering_dict['subsubclause_number'] = None
                elif level == 4:
                    numbering_dict['clause_number'] = node['numbering']
                    numbering_dict['subclause_number'] = None
                    numbering_dict['subsubclause_number'] = None
                elif level == 5:
                    numbering_dict['subclause_number'] = node['numbering']
                    numbering_dict['subsubclause_number'] = None
                elif level == 6:
                    numbering_dict['subsubclause_number'] = node['numbering']

                node.update(numbering_dict)
                if level > 0:
                    flattened_conditions.append(node)
                numb_print = '.'.join(filter(None, [numbering_dict.get('section_number'), numbering_dict.get('paragraph_number'), numbering_dict.get('subparagraph_number'), numbering_dict.get('clause_number'), numbering_dict.get('subclause_number'), numbering_dict.get('subsubclause_number')]))
                logger.info(f"{'  ' * level}{numb_print} {(node.get('text') or '')[:80]}")
                for child in node['children']:
                    dfs(child, level + 1, numbering_dict.copy())
            dfs(root)
            return flattened_conditions

        roots = create_tree(content)
        logger.info(json.dumps(roots, indent=4))
        cond_node = {
            'id': 'conditions',
            'text': '',
            'children': roots
        }
        # cond_node = next((x for x in roots[2:] if 'conditions' in x['text'].lower()), None)
        # logger.info(f'Found conditions node: {cond_node}')
        sorted_docs = flatten(cond_node)

        found_numbering = -1
        for idx, d in enumerate(sorted_docs):
            if d.get('numbering'):
                found_numbering = idx
                break
        
        sorted_docs = sorted_docs[found_numbering:]

        # sorted_docs = sorted(document_json.values(), key=lambda x: x['sort_key'])


        for p in sorted_docs:
            p['text'] = p['text'].strip()
            if p.get('numbering'):
                p['text'] = p['text'].lstrip(p['numbering'])
                p['numbering'] = re.sub(r'\W+', '', p['numbering']) 
            p['text'] = p['text'].lstrip('.').strip()

        with open("debug/before_transformation.json", "w") as f:
            f.write(json.dumps(sorted_docs, indent=4))

        for idx, p in enumerate(sorted_docs):
            if p.get('type') == 'section' and not p.get('numbering'):
                p['combined'] = True
                continue

            parent = sorted_docs[idx - 1] if idx > 0 else None

            if not p.get('numbering') and parent and parent.get('combined'):
                p['combined'] = True
                continue

            if not p.get('numbering') and parent and parent.get('numbering'):
                parent['title'] = parent['text'] if parent.get('title') is None or parent.get('title') == '' else ''
                parent['text'] = p['text']
                logger.info(f'{parent}')
                parentbb = parent['meta']['bounding_box']
                pbb = p['meta']['bounding_box']
                
                parent['meta']['bounding_box'] = {
                    'top': min(parentbb['top'], pbb['top']),
                    'bottom': max(parentbb['bottom'], pbb['bottom']),
                    'left': min(parentbb['left'], pbb['left']),
                    'right': max(parentbb['right'], pbb['right']),
                }

                logger.info(f'Combing with parent. {p.get("section_number")}.{p.get("paragraph_number")}.{p.get("subparagraph_number")}.{p.get("clause_number")}.{p.get("subclause_number")}.{p.get("subsubclause_number")}')
                
                p['combined'] = True


            
        with open("debug/sorted_docs.json", "w") as f:
            f.write(json.dumps(sorted_docs, indent=4))



        for idx, p in enumerate(sorted_docs):
            # dot = '.'.join([p.get('section_number') or ' ', p.get('paragraph_number')or ' ', p.get('subparagraph_number') or ' ', p.get('clause_number') or ' ', p.get('subclause_number') or ' ', p.get('subsubclause_number') or ' '])

            # logger.info(f'{dot} {(p.get("text") or '')[:50]}')

            if p.get('type') == 'section' and not p.get('numbering'):
                p['combined'] = True
                continue

            # if p.get('paragraph_type') == 'title':
            #     p['title'] = p['text']
            #     p['text'] = ''
            # else:
            #     p['title'] = ''
            
            # if not p.get('numbering'):
            #     parent = sorted_docs[idx - 1] if idx > 0 else None

            #     pr = parent if not p.get('combined') else sorted_docs[idx - 2] if idx > 1 else None
            #     if pr and (pr.get('text') or '').endswith(','):
            #         logger.info(f'Combing with previous paragraph. {p.get('section_number')}.{p.get('paragraph_number')}.{p.get('subparagraph_number')}.{p.get('clause_number')}.{p.get('subclause_number')}.{p.get('subsubclause_number')}')
            #         pr['text'] = f'{pr['text']} {p['text']}'
            #         p['combined'] = True
            #         continue

            #     if parent and parent.get('numbering') and not parent.get('combined'):
            #         parent['title'] = parent['title'] or parent['text']
            #         parent['text'] = p['text']

            #         parentbb = parent['meta']['bounding_box']
            #         pbb = p['meta']['bounding_box']
                    
            #         parent['meta']['bounding_box'] = {
            #             'top': min(parentbb['top'], pbb['top']),
            #             'bottom': max(parentbb['bottom'], pbb['bottom']),
            #             'left': min(parentbb['left'], pbb['left']),
            #             'right': max(parentbb['right'], pbb['right']),
            #         }

            #         logger.info(f'Combing with parent. {p.get('section_number')}.{p.get('paragraph_number')}.{p.get('subparagraph_number')}.{p.get('clause_number')}.{p.get('subclause_number')}.{p.get('subsubclause_number')}')

                    
            #     p['combined'] = True
        sorted_docs = [p for p in sorted_docs if not p.get('combined')]

        with open("debug/combined_docs.json", "w") as f:
            f.write(json.dumps(sorted_docs, indent=4))
        
        # print(json.dumps(sorted_docs, indent=4))  # Debugging output

        conditions = []
        current_title = None
        for p in sorted_docs:
            if p.get('type') == 'section':
                current_title = p.get('title') or p['text']

            try:
                conditions.append(PermitCondition(
                    type=p.get('type'),
                    section=p.get('section_number'),
                    section_title=current_title,
                    paragraph=p.get('paragraph_number'),
                    subparagraph=p.get('subparagraph_number'),
                    clause=p.get('clause_number'),
                    subclause=p.get('subclause_number'),
                    subsubclause=p.get('subsubclause_number'),
                    condition_title=p.get('title'),
                    condition_text=p.get('text'),
                    page_number=p['meta'].get('page_number')
                ))
            except:
                logger.error(f"Failed to create PermitCondition from: {p}")
                raise

        return {"conditions": PermitConditions(conditions=conditions)}

        raise "Not implemented yet"  # Placeholder for the implementation

        # Parse the replies given and make sure they're valid json
        conditions: List[PermitCondition] = reduce(
            operator.concat, [self._parse_reply(reply) for reply in data.messages]
        )

        # Find the content of the last condition that was processed
        # so it can be passed along to the next iteration if needed
        for condition in conditions:
            if (
                condition is not None
                and condition.condition_text is not None
                and condition.condition_text != ""
            ):
                sec_par = ", ".join(filter(None, [f"section: {condition.section}" if condition.section else None,
                f"paragraph: {condition.paragraph}" if condition.paragraph else None,
                f"subparagraph: {condition.subparagraph}" if condition.subparagraph else None,
                f"clause: {condition.clause}" if condition.clause else None,
                f"subclause: {condition.subclause}" if condition.subclause else None,
                f"subsubclause: {condition.subsubclause}" if condition.subsubclause else None]))

                self.last_condition_text = f"""
                The last condition that was extracted was found in {sec_par}, {"and had roughly the following text: \n\n" + condition.condition_text if condition.condition_text else {"and had the following title: {condition.title}" if condition.condition_title else ""}}
                """

        if DEBUG_MODE:
            with open(f"debug/validator_page_{self.start_page}.json", "w") as f:
                f.write(
                    json.dumps(
                        PermitConditions(conditions=conditions).model_dump(mode="json"),
                        indent=4,
                    )
                )

        # If there are more pages to process, return the next iteration
        if self.start_page + self.max_pages < len(data.documents):
            self.start_page = self.start_page + self.max_pages

            self.documents += conditions

            iter = {
                "iteration": {
                    "start_page": self.start_page,
                    "last_condition_text": self.last_condition_text,
                }
            }

            return iter
        else:
            # If there are no more pages to process, return the conditions found
            all_replies = self.documents + conditions

            # all_replies = sorted(all_replies, key=lambda x: f"{x.section_paragraph}.{x.clause}.{x.subclause}.{x.subsubclause}")
            
            # group conditions by key (section_paragraph, clause, subclause, subsubclause)

            grouped_replies = {x.key(): x for x in all_replies}

            # for cond in all_replies:
            #     key = cond.key()
            #     parent_cond = cond.create_parent()

            #     if parent_cond.key() not in grouped_replies and parent_cond.condition_type() != ConditionType.SECTION:
            #         cond.condition_title = ''

            #         grouped_replies[parent_cond.key()] = parent_cond

            #         logger.info(f"Parent clause: {parent_cond.key()} of {key} is missing")

            #     parent = grouped_replies.get(parent_cond.key())
            #     if parent and cond and parent.condition_title == cond.condition_title:
            #         cond.condition_title = ''

            #     if parent and cond and parent.condition_text == cond.condition_text:
            #         parent.condition_text = ''
            #     if cond.section_paragraph == 'C' and cond.subparagraph == '4' and cond.clause == 'c' and cond.subclause == 'i':
            #         print('Condition 1:')
            #         print(cond.condition_title, cond.paragraph_title)
            #         print('Parent condition:')
            #         print(parent.condition_title, parent.paragraph_title)

            sorted_replies = sorted(grouped_replies.values(), key=lambda x: x.key())

            sections = {c.section: c for c in sorted_replies if c.condition_type() == ConditionType.SECTION}

            logger.info('seeeections')
            logger.info(sections)

            for cond in sorted_replies:
                logger.info(f'{cond.section} {cond.type}')
                sec = sections.get(cond.section)
                if sec:
                    cond.section_title = sec.section_title


            return {"conditions": PermitConditions(conditions=sorted_replies)}

    def _parse_reply(self, reply) -> List[PromptResponse]:
        try:
            conditions = json.loads(reply.content)
    

            # for condition in content:
            #     # sometimes, conditions are nested in a list in the response
            #     # from the pipeline, so we need to flatten them
            #     if isinstance(condition, list):
            #         for c in condition:
            #             conditions.append(c)
            #     else:
            #         conditions.append(condition)

            actual_conditions = []
            for c in conditions:
                if 'page_number' in c and c.get('page_number') == '':
                    c['page_number'] = None
                
                has_sub_cond = False
                for key, value in c.items():
                    if isinstance(value, list):
                        for cond in value:
                            actual_conditions.append(cond)
                        has_sub_cond = True
                if not has_sub_cond:
                    actual_conditions.append(c)
            
            transformed = []

            flattened = []
            for c in actual_conditions:
                if isinstance(c, list):
                    flattened += c
                else:
                    flattened.append(c)

            for c in flattened:
                if isinstance(c, list):
                    raise Exception(f"Invalid condition format. Conditions should not be nested in a list. {len(c)}")
                if not isinstance(c, dict):
                    logger.info(f'Invalid condition format. Condition is not a dictionary. {c}')
                    continue
                tp = _clean(c.get('type'))
                section = _clean(c.get('section_number', ''))
                paragraph = _clean(c.get('paragraph_number', ''))
                subparagraph = _clean(c.get('subparagraph_number', ''))
                clause = _clean(c.get('clause_number', ''))
                subclause = _clean(c.get('subclause_number', ''))
                subsubclause = _clean(c.get('subsubclause_number', ''))
                title = c.get('title')
                page_number = c.get('page_number')
                condition_text = c.get('text')

                c = PermitCondition(
                    type=tp,
                    section=section,
                    paragraph=paragraph,
                    subparagraph=subparagraph,
                    clause=clause,
                    subclause=subclause,
                    subsubclause=subsubclause,
                    condition_title=title,
                    condition_text=condition_text,
                    page_number=page_number
                )

                transformed.append(c)

            response = PermitConditions.model_validate({"conditions": transformed})

            return response.conditions
        except Exception as e:
            logger.error(
                f"Failed to parse permit condition. Content is not valid json. {e}"
            )
            logger.error(reply.content)
            raise


def create_tree(nodes):
    # Create a dictionary to hold the references to each node's dictionary
    node_dict = {node['id']: {'id': node['id'], 'numbering': node.get('numbering'), 'children': [], **node} for node in nodes}
    roots = []

    # Build the tree by assigning children to their parents
    for node in nodes:
        node_id = node['id']
        parent_id = node.get('parent_id')
        if parent_id is not None and parent_id in node_dict:
            node_dict[parent_id]['children'].append(node_dict[node_id])
        else:
            roots.append(node_dict[node_id])

    return roots
