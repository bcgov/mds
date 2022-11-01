import pytest

from app.api.parties.party.models.address import Address


def test_party_model_validate_post_code():
    with pytest.raises(AssertionError) as e:
        Address(
            suite_no='123',
            address_line_1='Foo',
            address_line_2='Bar',
            city='Baz',
            sub_division_code='AB',
            post_code='0' * 7
            address_type_code='CAN')
    assert 'post_code must not exceed 6 characters' in str(e.value)

    with pytest.raises(AssertionError) as e:
        Address(
            suite_no='123',
            address_line_1='Foo',
            address_line_2='Bar',
            city='Baz',
            sub_division_code='AB',
            post_code='0' * 6
            address_type_code='CAN')
    assert 'Invalid post_code format' in str(e.value)
