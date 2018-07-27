import random, string

def random_key_gen(key_length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=key_length))