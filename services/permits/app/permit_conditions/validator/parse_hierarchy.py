import logging
import re

from app.permit_conditions.validator.next_character_in_sequence import (
    find_next_character_in_sequence,
)

logger = logging.getLogger(__name__)

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
    for idx, paragraph in enumerate(paragraphs):
        paragraph['original_text'] = paragraph['text']
        pattern = next((pattern for pattern in patterns if pattern['pattern'].match(paragraph['text'])), None)

        if not pattern:
            paragraph['regex'] = None
            paragraph['numbering'] = None
            continue
        
        mtch = pattern['pattern'].match(paragraph['text'])
        numbering = mtch.group(1)
        paragraph['regex'] = pattern['name']
        paragraph['numbering'] = numbering.strip()

        paragraph['text'] = re.sub(by_name[paragraph['regex']], '', paragraph['text'])
        paragraph['text'] = re.sub(r'^\W+', '', paragraph['text']).strip()

    # for idx, paragraph in enumerate(paragraphs):
    #     # Handle roman numerals gracefully. i could either be a roman numeral or a lowercase letter. We need to check the
    #     # previous and next paragraphs to determine which one it is.

    #     # if paragraph['regex'] == 'lowercase_letter' and idx>0:
    #     #     previous = paragraphs[idx - 1] if idx > 0 else None
            
    #     #     matches_roman = by_name['roman_numeral'].match(paragraph['text'])

    #     #     # if the current pararaph matches a roman numeral, we can check assume it is a roman numeral if the previous
    #     #     # paragraph was not an h) (because that's the only time i would be new section instead of a subsection)
    #     #     if matches_roman and (previous['regex'] != 'lower_case' or previous['regex'] == 'roman_numeral'):
    #     #         paragraph['regex'] = 'roman_numeral'

    #     #     # In the unfortunate event paragraph h) has a subparagraph i) scan the next paragraphs until you get to one
    #     #     # that is not a roman numeral. If during that time you hit another i), you can assume the current paragraph
    #     #     # was intended as a child to the previous paragraph.
    #     #     if matches_roman and previous['regex'] == 'lower_case' and previous['numbering'] == 'h':
    #     #         for next_ps in paragraphs[idx + 1:]:
    #     #             matches_lowercase = by_name['lowercase_letter'].match(next_ps['text'])
    #     #             matches_roman = by_name['roman_numeral'].match(next_ps['text'])

    #     #             if matches_roman and next_ps['numbering'] == paragraph['numbering']:
    #     #                 paragraph['regex'] = 'roman_numeral'
    #     #                 break

    #     #             if matches_lowercase and not matches_roman:
    #     #                 break
        
    #     # # if paragraph['text'] == 'b) Water Management2':
    #     # #     import pdb; pdb.set_trace()
    #     # # We 
    #     # if paragraph['regex'] == 'roman_numeral':
    #     #     for prev_sub in paragraphs[:idx][::-1]:
    #     #         if prev_sub['regex'] != 'roman_numeral':
    #     #             break
    #     #         if prev_sub['regex'] == 'roman_numeral' and prev_sub['numbering'] == paragraph['numbering']:
    #     #             paragraph['regex'] = 'lowercase_letter'
    #     #             break
    #     if paragraph['regex']:
    #         paragraph['text'] = re.sub(by_name[paragraph['regex']], '', paragraph['text'])
    #         paragraph['text'] = re.sub(r'^\W+', '', paragraph['text']).strip()
    
    return paragraphs

def match(paragraph):
    for pattern in patterns:
        if pattern['pattern'].match(paragraph['text']):
            return pattern['name']
    return None

def percent_increase(prev, curr):
    prev_bounding_box = prev.get('bounding_box') or {}
    bounding_box = curr.get('bounding_box') or {}

    if prev_bounding_box.get('left') and bounding_box.get('left'):
        increase = (bounding_box['left']-prev_bounding_box['left']) *100/prev_bounding_box['left']
        return increase
    
    return None
def build_hierarchy(paragraphs):
    current_section = None
    current_paragraph = None
    current_subparagraph = None
    current_clause = None
    current_subclause = None
    current_subsubclause = None

    structure = []
    last_paragraph = {}

    level = 0
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
                    increase = percent_increase(prev_p, p)
                    if increase and increase > 15:
                        regx = 'roman_numeral'
                
                p['regex'] = regx
            found = regx in structure
            skip_last_update = False

            if not found:
                structure.append(regx)
                if len(structure) > 1:
                    level += 1
            else:
                nw_level = structure.index(regx)

                percent = percent_increase(last_paragraph[regx], p)

                percent_curr = percent_increase(paragraphs[idx-1], p) if idx > 0 else None

                # if p['text'] == 'No personnel must work alone within this zone at any time;':
                #     import pdb; pdb.set_trace()
                if nw_level != level:
                    if nw_level < level and percent and percent > 10:
                        if percent_curr and percent_curr > 10:
                            level +=1
                            skip_last_update = True
                    elif nw_level < level and (percent_curr and (percent_curr > -10 and percent_curr < 10)):
                        pass
                    else:
                        level = nw_level
                    # elif not percent_curr or percent_curr > 10 or percent_curr < -10:
                    #     level = nw_level
                else:
                    level = nw_level        

            if level == 0:
                current_section = p['numbering']
                current_paragraph = None
                current_subparagraph = None
                current_clause = None
                current_subclause = None
                current_subsubclause = None
            elif level == 1:
                current_paragraph = p['numbering']
                current_subparagraph = None
                current_clause = None
                current_subclause = None
                current_subsubclause = None
            elif level == 2:
                current_subparagraph = p['numbering']
                current_clause = None
                current_subclause = None
                current_subsubclause = None
            elif level == 3:
                current_clause = p['numbering']
                current_subclause = None
                current_subsubclause = None
            elif level == 4:
                current_subclause = p['numbering']
                current_subsubclause = None
            elif level == 5:
                current_subsubclause = p['numbering']

            if not skip_last_update:
                last_paragraph[regx] = p
        p['section'] = current_section
        p['paragraph'] = current_paragraph
        p['subparagraph'] = current_subparagraph
        p['clause'] = current_clause
        p['subclause'] = current_subclause      
        p['subsubclause'] = current_subsubclause
        del p['original_text']


    return paragraphs


def parse_hierarchy(paragraphs):
    paragraphs = split_numbering(paragraphs)

    paragraphs = build_hierarchy(paragraphs)

    return paragraphs
