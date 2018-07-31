import random, string

from models.mines import MineDetails

def random_key_gen(prefix='', key_length=10, numbers=True, letters=True):
    choices = ''
    if numbers:
        choices += string.digits
    if letters:
        choices += string.ascii_letters
    return prefix + ''.join(random.choices(choices, k=key_length))

def generate_mine_no():
    mine_no=random_key_gen(prefix='BLAH', key_length=4, letters=False)
    while MineDetails.find_by_mine_no(mine_no):
        mine_no=random_key_gen(prefix='BLAH', key_length=4, letters=False)
    return mine_no