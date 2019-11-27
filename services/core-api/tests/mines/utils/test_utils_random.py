from app.api.utils.random import random_key_gen, generate_mine_no, generate_mine_name, random_geo


def test_utils_random_key_gen():
    random_key = random_key_gen(prefix='BLAH', key_length=4)
    assert 'BLAH' in random_key
    assert len(random_key) == 8


def test_generate_mine_no(db_session):
    random_mine_no = generate_mine_no()
    assert 'B' in random_mine_no
    assert len(random_mine_no) == 7


def test_generate_mine_name():
    random_name = generate_mine_name()
    name_list = random_name.split()
    name_list_length = len(name_list)
    assert name_list_length < 3 and name_list_length > 0


def test_random_geo():
    random_location = random_geo()
    latitude = random_location.get('latitude')
    longitude = random_location.get('longitude')
    assert latitude is not None
    assert longitude is not None
