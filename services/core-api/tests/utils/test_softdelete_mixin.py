import uuid, pytest, decimal, math, datetime
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, Base
from app.api.mines.mine.models.mine import Mine
from tests.factories import MineFactory


def test_column_existence(db_session):
    assert issubclass(Mine, SoftDeleteMixin)
    assert hasattr(MineFactory(), 'deleted_ind')


def test_delete_method(db_session):
    assert issubclass(Mine, SoftDeleteMixin)
    model = MineFactory()
    model.delete()
    assert model.deleted_ind == True


def test_delete_method_does_not_hard_delete(db_session):
    assert issubclass(Mine, SoftDeleteMixin)
    model = MineFactory()
    model.delete()
    assert len(db_session.deleted) == 0
