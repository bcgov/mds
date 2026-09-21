import pytest

from app.api.parties.party.models.address import Address


def test_party_model_validate_post_code(app):
    with app.app_context():
        with pytest.raises(AssertionError) as e:
            Address(
                suite_no='123',
                address_line_1='Foo',
                address_line_2='Bar',
                city='Baz',
                sub_division_code='AB',
                post_code='0' * 11,
                address_type_code='CAN')
        assert 'post_code must not exceed 10 characters' in str(e.value)

        with pytest.raises(AssertionError) as e:
            Address(
                suite_no='123',
                address_line_1='Foo',
                address_line_2='Bar',
                city='Baz',
                sub_division_code='AB',
                post_code='0' * 6,
                address_type_code='CAN')
        assert 'Invalid post_code format' in str(e.value)


def test_post_code_normalization_and_validation(app):
    with app.app_context():
        a = Address(
            suite_no='123',
            address_line_1='Foo',
            city='Baz',
            address_type_code='CAN',
            post_code='v2r 2a2'
        )
        assert a.post_code == "V2R2A2"

        a = Address(
            suite_no='123',
            address_line_1='Foo',
            city='Baz',
            address_type_code='CAN',
            post_code='v2r-2a2'
        )
        assert a.post_code == "V2R2A2"

        a = Address(
            suite_no='123',
            address_line_1='Foo',
            city='Baz',
            address_type_code='CAN',
            post_code='K1A0B1'
        )
        assert a.post_code == "K1A0B1"

        with pytest.raises(AssertionError) as e:
            Address(
                suite_no='123',
                address_line_1='Foo',
                city='Baz',
                address_type_code='CAN',
                post_code='ABC123'
            )
        assert 'Invalid post_code format' in str(e.value)

        a = Address(
            address_line_1='Foo',
            city='Baz',
            address_type_code='USA',
            post_code='12345-6789'
        )
        assert a.post_code == "12345-6789"

        a = Address(
            address_line_1='Foo',
            city='Baz',
            address_type_code='INT',
            post_code='abc xyz 1'
        )
        assert a.post_code == "abc xyz 1"
