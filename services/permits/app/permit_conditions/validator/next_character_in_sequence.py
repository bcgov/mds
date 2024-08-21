import logging

logger = logging.getLogger(__name__)
def find_next_character_in_sequence(current_character, type):
    if type == 'lowercase_letter':
        if current_character != 'z':
            logger.info(f'Current character: {current_character} {type}')
            return chr(ord(current_character) + 1)
        else:
            return 'a'

    elif type == 'uppercase_letter':
        if current_character != 'Z':
            return chr(ord(current_character) + 1)
        else:
            return '0'

    elif type == 'number':
        return str(int(current_character) + 1)

    elif type == 'roman_numeral':
        integer_value = roman_to_integer(current_character.upper())
        if integer_value < 3999:  # Assuming the limit is 3999
            return integer_to_roman(integer_value + 1).lower()
        else:
            return 'Error: Roman numeral sequence limit reached'
    else:
        return 'Error: Character not recognized in sequence'

def roman_to_integer(roman):
    roman_numerals = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    integer_value = 0
    prev_value = 0
    for char in reversed(roman):
        value = roman_numerals[char]
        if value < prev_value:
            integer_value -= value
        else:
            integer_value += value
        prev_value = value
    return integer_value

def integer_to_roman(integer):
    val = [
        (1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'),
        (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'),
        (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')
    ]
    roman_numeral = ''
    for (arabic, roman) in val:
        (factor, integer) = divmod(integer, arabic)
        roman_numeral += roman * factor
    return roman_numeral
