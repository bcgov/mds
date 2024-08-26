import logging
import re

from app.permit_conditions.validator.next_character_in_sequence import (
    find_next_character_in_sequence,
)

logger = logging.getLogger(__name__)

# Patterns for different types of numbering at the beginning of a string.
# Example:
# 1. This is a test. <- 1.
# a. This is another test. <- a.
# i. This is yet another test. <- i.
# (1) This is a test. <- (1)
# B) This is another test. <- B)
patterns = [
    {
        'name': 'uppercase_letter',
        'pattern': re.compile(r'^(?:\(|)([A-Z]{0,3}+)(?:\)|)[\.\)\s]*\s+'),  # Uppercase letter(s) optionally surrounded by parentheses, followed by optional separator or space
    },
    {
        'name': 'number',
        'pattern': re.compile(r'^(?:\(|)(\d+)(?:\)|)[\.\)\s]*\s+'),     # Number optionally surrounded by parentheses, followed by optional separator or space
    },
    {
        'name': 'lowercase_letter',
        'pattern': re.compile(r'^(?:\(|)([a-z]{0,3}+)(?:\)|)[\.\)\s]*\s+'),  # Lowercase letter(s) optionally surrounded by parentheses, followed by optional separator or space
    },
    {
        'name': 'roman_numeral',
        'pattern': re.compile(r'^(?:\(|)([ivx]+)(?:\)|)\s*'),       # Roman numeral optionally surrounded by parentheses (assuming this is always followed by a space)
    },
]

by_name = {pattern['name']: pattern['pattern'] for pattern in patterns}

def split_numbering(paragraphs):
    """
    Given a list of paragraphs, this function will split the numbering from the text
    and return the paragraphs with the numbering and text separated.

    Args:
        paragraphs (list): A list of paragraphs.
    
    Returns:
        list: A list of paragraphs with the numbering and text separated.

    Example:
        Input: 
            - [{'text': '1. This is a test.'}, {'text': 'a. This is another test.'}]
        Output:
            - [{'numbering': '1.', 'text': 'This is a test.', 'regex': 'number'}, {'numbering': '2.', 'text': 'This is another test.', 'regex': 'lowercase_letter'}]
        

    """
    for paragraph in paragraphs:
        paragraph['original_text'] = paragraph['text']

        # Find what pattern matches the paragraph (if any)
        pattern = next((pattern for pattern in patterns if pattern['pattern'].match(paragraph['text'])), None)

        if not pattern:
            paragraph['regex'] = None
            paragraph['numbering'] = None
            continue
        
        mtch = pattern['pattern'].match(paragraph['text'])
        numbering = mtch.group(1)
        paragraph['regex'] = pattern['name']
        paragraph['numbering'] = numbering.strip()

        # Remove the numbering found from the beginning of the paragraph
        paragraph['text'] = re.sub(by_name[paragraph['regex']], '', paragraph['text'])

        # Remove any leading whitespace or non-word characters from the beginning of the paragraph
        paragraph['text'] = re.sub(r'^\W+', '', paragraph['text']).strip()

    
    for idx, p in enumerate(paragraphs):
        regx = p['regex']

        if regx:
            if regx == 'lowercase_letter' and by_name['roman_numeral'].match(p['original_text']):
                prev_p = next((p for p in reversed(paragraphs[:idx]) if p['numbering'] is not None), None)           

                if prev_p and prev_p['regex'] == 'lowercase_letter' and prev_p['numbering'] != 'h':
                    regx = 'roman_numeral'


                if prev_p and prev_p['regex'] == 'roman_numeral' and find_next_character_in_sequence(prev_p['numbering'], 'roman_numeral') == p['numbering']:
                    regx = 'roman_numeral'

                if prev_p and prev_p['regex'] == 'lowercase_letter' and prev_p['numbering'] == 'h':
                    increase = _percent_increase(prev_p, p)
                    if increase and increase > 15:
                        regx = 'roman_numeral'
                
                p['regex'] = regx

    return paragraphs

def match(paragraph):
    for pattern in patterns:
        if pattern['pattern'].match(paragraph['text']):
            return pattern['name']
    return None

def _percent_increase(prev, curr):
    # Calculate the percentage increase between the left bounding box of the current and previous paragraph
    prev_bounding_box = prev.get('bounding_box') or {}
    bounding_box = curr.get('bounding_box') or {}

    if prev_bounding_box.get('left') and bounding_box.get('left'):
        increase = (bounding_box['left']-prev_bounding_box['left']) *100/prev_bounding_box['left']
        return increase
    
    return None


def _update_hierarchy_state(hierarchy_state, level, numbering):
    hierarchy_keys = ['section', 'paragraph', 'subparagraph', 'clause', 'subclause', 'subsubclause']


    for i, key in enumerate(hierarchy_keys):
        if i == level:
            hierarchy_state[key] = numbering
        elif i > level:
            hierarchy_state[key] = None
    return hierarchy_state


def build_hierarchy(paragraphs):
    hierarchy_state = {key: None for key in ['section', 'paragraph', 'subparagraph', 'clause', 'subclause', 'subsubclause']}
    structure = []
    last_paragraph = {}
    level = 0

    for idx, paragraph in enumerate(paragraphs):
        regx = paragraph['regex']

        if regx:
            level, skip_last_update = _update_level(paragraphs, structure, last_paragraph, level, idx, paragraph, regx)
            hierarchy_state = _update_hierarchy_state(hierarchy_state, level, paragraph['numbering'])


            if not skip_last_update:
                last_paragraph[regx] = paragraph

        for key in hierarchy_state:
            paragraph[key] = hierarchy_state[key]
        del paragraph['original_text']



    return paragraphs

NEW_PARAGRAPH_THRESHOLD = 10 # If indentation is 10% greater than the previous paragraph, it's likely a new indentation level (e.g. a new section, paragraph, etc.). No science behind it, other than observation of a couple of example outputs from Document intelligence.

def _update_level(paragraphs, structure, last_paragraph, level, idx, p, regx):

    if regx not in structure:
        # If we have not encountered this type of numbering before, add it to the structure and increase the level we're at
        structure.append(regx)
        if len(structure) > 1:
            level += 1
        return level, False


    # Compare the current paragraph with the previous one of the same numbering system to determine if we should decrease the level
    percent = _percent_increase(last_paragraph[regx], p)

    # Compare the current paragraph with the previous parabraph to determine if we should increase the level
    percent_curr = _percent_increase(paragraphs[idx-1], p) if idx > 0 else None

    level_of_last_matching_numbering = structure.index(regx)


    # If the current paragraph is at the same level as the last paragraph of the same numbering system, we don't need to update the level
    if level_of_last_matching_numbering == level:
        return level, False
    
    def _is_new_paragraph():
        return percent_curr and percent_curr > NEW_PARAGRAPH_THRESHOLD

    if level_of_last_matching_numbering < level and percent and percent > NEW_PARAGRAPH_THRESHOLD:
        if _is_new_paragraph():
            return level + 1, True
        else:
            return level, False
    elif level_of_last_matching_numbering < level and (percent_curr and (percent_curr > -NEW_PARAGRAPH_THRESHOLD and percent_curr < NEW_PARAGRAPH_THRESHOLD)):
        return level, False
    else:
        return level_of_last_matching_numbering, False


def parse_hierarchy(paragraphs):
    paragraphs = split_numbering(paragraphs)
    paragraphs = build_hierarchy(paragraphs)

    return paragraphs
