import logging
import re

logger = logging.getLogger(__name__)

NEW_PARAGRAPH_THRESHOLD = 10 # If indentation is 10% greater than the previous paragraph, it's likely a new indentation level (e.g. a new section, paragraph, etc.). No science behind it, other than observation of a couple of example outputs from Document intelligence.

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


def parse_hierarchy(paragraphs):
    paragraphs = split_numbering(paragraphs)
    paragraphs = build_hierarchy(paragraphs)

    return paragraphs

def split_numbering(paragraphs):
    """
    Given a list of paragraphs, this function will split the numbering from the text
    and return the paragraphs with the numbering and text separated.

    It will also return the type of numbering found in the paragraph (e.g. lowercase letter, number, roman numeral, uppercase letter)
    to be used by feature steps to determine the hierarchy of the paragraphs.

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
    for idx, paragraph in enumerate(paragraphs):
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

        # Check if the paragraph is actually a roman numeral this can happen seeing as the regex for lowercase letter and roman numeral overlap
        if paragraph['regex'] == 'lowercase_letter' and _is_actually_roman_numeral(paragraphs, paragraph, idx):
            paragraph['regex'] = 'roman_numeral'

        # Remove the numbering found from the beginning of the paragraph
        paragraph['text'] = re.sub(by_name[paragraph['regex']], '', paragraph['text'])

        # Remove any leading whitespace or non-word characters from the beginning of the paragraph
        paragraph['text'] = re.sub(r'^\W+', '', paragraph['text']).strip()

    return paragraphs

def build_hierarchy(paragraphs):
    """
    Builds a nested for the given list of paragraphs based on the numbering (and regex) found in the paragraphs.

    Example input:

    A - uppercase_letter - This is a test
    1 - number - This is a subtest
        a. - lowercase_letter - This is a subsubtest
            i. - roman_numeral This is a subsubsubtest

    Becomes:
        A: This is a test
        A.1 This is a subtest
        A.1.a This is a subsubtest
        A.1.a.i This is a subsubsubtest

    Args:
        paragraphs (list): A list of dictionaries representing paragraphs.
    Returns:
        list: The list of paragraphs with the hierarchy built in.
    """

    # Define the different levels of the hierarchy
    hierarchy_state = {key: None for key in ['section', 'paragraph', 'subparagraph', 'clause', 'subclause', 'subsubclause']}
    structure = []
    last_paragraph = {}
    level = 0

    for idx, paragraph in enumerate(paragraphs):
        regx = paragraph['regex']

        if regx:
            # Based on the matching pattern, update the "level" we're at (section, paragraph, subparagraph, etc.)
            level, skip_last_update = _update_level(paragraphs, structure, last_paragraph, level, idx, paragraph, regx)

            # Update the hierarchy state based on the level we're at (e.g. {section: A, paragraph: 1, subparagraph: 2})
            hierarchy_state = _update_hierarchy_state(hierarchy_state, level, paragraph['numbering'])

            if not skip_last_update:
                last_paragraph[regx] = paragraph

        # Add the hierarchy state to the paragraph based on the current state
        # E.g. {section: A, paragraph: 1, subparagraph: a}
        for key in hierarchy_state:
            paragraph[key] = hierarchy_state[key]

    return paragraphs

def _update_level(paragraphs, structure, last_paragraph, level, idx, p, regx):
    if regx not in structure:
        # If we have not encountered this type of numbering before, add it to the structure and increase the level we're at.
        # For example it's the first time we encounter a lowercase letter
        structure.append(regx)
        if len(structure) > 1:
            level += 1
        return level, False

    # Compare the current paragraph with the previous one of the same numbering system to determine if we should increase, decrease or keep the level
    percent = _percent_increase(last_paragraph[regx], p)
    percent_curr = _percent_increase(paragraphs[idx-1], p) if idx > 0 else None
    
    level_of_last_matching_numbering = structure.index(regx)

    # If the current paragraph is at the same level as the last paragraph of the same numbering system, we don't need to update the level
    if level_of_last_matching_numbering == level:
        return level, False
    
    def _found_new_numbering_scheme():
        return percent_curr and percent_curr > NEW_PARAGRAPH_THRESHOLD

    # If we previously found the same numbering system, but the current paragraph is more indented than the previous one, it's likely a new level
    # Example: lowercase letter (a) could be used both for subparagraphs, and subclauses
    if level_of_last_matching_numbering < level and percent and percent > NEW_PARAGRAPH_THRESHOLD:
        if _found_new_numbering_scheme():
            return level + 1, True
        else:
            return level, False
    elif level_of_last_matching_numbering < level and (percent_curr and (percent_curr > -NEW_PARAGRAPH_THRESHOLD and percent_curr < NEW_PARAGRAPH_THRESHOLD)):
        return level, False
    else:
        return level_of_last_matching_numbering, False

def _is_actually_roman_numeral(paragraphs, paragraph, idx):
    if not by_name['roman_numeral'].match(paragraph['text']):
        return False

    regx = paragraph['regex']
    prev_p = next((p for p in reversed(paragraphs[:idx]) if p['numbering'] is not None), None)

    # If the previous paragraph is a lowercase letter that is not a h, it's likely a roman numeral (seeing as i) comes after h)
    if prev_p and prev_p['regex'] == 'lowercase_letter' and prev_p['numbering'] != 'h':
        regx = 'roman_numeral'

    if prev_p and prev_p['regex'] == 'roman_numeral':
        # If the previous paragraph is a roman numeral, this is likely a roman numeral if the indentation is the same
        increase = _percent_increase(prev_p, paragraph)
        if increase is not None and increase < NEW_PARAGRAPH_THRESHOLD and increase > -NEW_PARAGRAPH_THRESHOLD:
            regx = 'roman_numeral'
    
    if prev_p and prev_p['regex'] == 'lowercase_letter' and prev_p['numbering'] == 'h':
        # If the previous paragraph was an h, it's likely a roman numeral if it's more indented than the previous paragraph
        increase = _percent_increase(prev_p, paragraph)
        if increase and increase > NEW_PARAGRAPH_THRESHOLD:
            regx = 'roman_numeral'

    return regx == 'roman_numeral'

def _percent_increase(prev, curr):
    # Calculate the percentage increase between the left bounding box of the current and previous paragraph
    prev_meta = prev.get('meta') or {}
    curr_meta = curr.get('meta') or {}

    prev_bounding_box = prev_meta.get('bounding_box') or {}
    bounding_box = curr_meta.get('bounding_box') or {}
    if prev_bounding_box.get('left') and bounding_box.get('left'):
        increase = (bounding_box['left']-prev_bounding_box['left']) *100/prev_bounding_box['left']
        return increase
    
    return None

def _update_hierarchy_state(hierarchy_state, level, numbering):
    # Update the hierarchy state based on the level we're at (e.g. {section: A, paragraph: 1, subparagraph: 2})
    # Example: If the current state is {section: A, paragraph: 1, subparagraph: a}, level is 1 and numbering 2, the new state will become {section: A, paragraph: 2, subparagraph: None}

    hierarchy_keys = ['section', 'paragraph', 'subparagraph', 'clause', 'subclause', 'subsubclause']

    for i, key in enumerate(hierarchy_keys):
        if i == level:
            hierarchy_state[key] = numbering
        elif i > level:
            hierarchy_state[key] = None
    return hierarchy_state
