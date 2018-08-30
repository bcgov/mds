import math
import random
import string

from ..models.mines import MineDetail

VOWELS = "aeiou"
CONSONANTS = "".join(set(string.ascii_lowercase) - set(VOWELS))
RANDOM_CENTERS = [
    {'latitude': 51.283958, 'longitude': -120.608253, 'radius_in_m': 221000},
    {'latitude': 54.124806, 'longitude': -124.155545, 'radius_in_m': 221000},
    {'latitude': 57.810546, 'longitude': -128.198514, 'radius_in_m': 221000},
    {'latitude': 57.810546, 'longitude': -123.891873, 'radius_in_m': 221000}
]

def random_key_gen(prefix='', key_length=10, numbers=True, letters=True):
    choices = ''
    if numbers:
        choices += string.digits
    if letters:
        choices += string.ascii_letters
    return prefix + ''.join(random.choices(choices, k=key_length))


def generate_mine_no():
    mine_no = random_key_gen(prefix='BLAH', key_length=4, letters=False)
    while MineDetail.find_by_mine_no(mine_no):
        mine_no = random_key_gen(prefix='BLAH', key_length=4, letters=False)
    return mine_no


def generate_name():
    names = []
    for i in range(random.randint(1,2)):
        word = ""
        for j in range(random.randint(3,11)):
            if j % 2 == 0:
                word += random.choice(CONSONANTS)
            else:
                word += random.choice(VOWELS)
        names.append(word.capitalize())
    return ' '.join(names)


def random_geo():
    random_center = random.choice(RANDOM_CENTERS)
    y0 = random_center.get('latitude')
    x0 = random_center.get('longitude')
    rd = random_center.get('radius_in_m') / 111300

    u = random.random()
    v = random.random()

    w = rd * math.sqrt(u)
    t = 2 * math.pi * v
    x = w * math.cos(t)
    y = w * math.sin(t)

    return {
        'latitude': y + y0,
        'longitude': x + x0
    }
