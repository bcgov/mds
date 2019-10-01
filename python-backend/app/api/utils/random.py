import math
import random
import string

import names

from datetime import datetime
from app.api.mines.mine.models.mine import Mine

VOWELS = "aeiou"
CONSONANTS = "".join(set(string.ascii_lowercase) - set(VOWELS))
RANDOM_CENTERS = [{
    'latitude': 51.283958,
    'longitude': -120.608253,
    'radius_in_m': 221000
}, {
    'latitude': 54.124806,
    'longitude': -124.155545,
    'radius_in_m': 221000
}, {
    'latitude': 57.810546,
    'longitude': -128.198514,
    'radius_in_m': 221000
}, {
    'latitude': 57.810546,
    'longitude': -123.891873,
    'radius_in_m': 221000
}]


def random_key_gen(prefix='', key_length=10, numbers=True, letters=True):
    choices = ''
    if numbers:
        choices += string.digits
    if letters:
        choices += string.ascii_letters
    return prefix + ''.join(random.choices(choices, k=key_length))


def generate_mine_no():
    mine_no = random_key_gen(prefix='B', key_length=6, letters=False)
    while Mine.find_by_mine_no(mine_no):
        mine_no = random_key_gen(prefix='B', key_length=6, letters=False)
    return mine_no


def generate_mine_name():
    name_list = []
    for i in range(random.randint(1, 2)):
        name_list.append(names.get_last_name())
    return ' '.join(name_list)


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

    return {'latitude': y + y0, 'longitude': x + x0}


def random_date():
    random_year = random.randint(1970, 2017)
    random_month = random.randint(1, 12)
    random_day = random.randint(1, 28)
    random_date = datetime(random_year, random_month, random_day)
    return random_date


def random_region():
    mine_region_code = ['SW', 'SC', 'NW', 'NE', 'SE']
    random_region = random.choice(mine_region_code)
    return random_region


def random_mine_category():
    major_mine = [True, False]
    random_category = random.choice(major_mine)
    return random_category