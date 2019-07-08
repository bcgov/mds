import unittest
import pytest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.extensions import db as _db
from flask import Flask as create_app

from app.nris.etl.nris_etl import etl_nris_data
from app.nris.utils.base_model import Base


from app.nris.models.inspection_type import InspectionType
# TODO: import the massive raw nris_etl data strings


def test_etl_nris_data(session):
    # etl_nris_data()
    session.add(InspectionType(1, 'TypeA', 'This is the first test type'))
    session.commit()
    assert len(InspectionType.find_all_inspection_types()) is 1


def test_data_does_not_persist(session):
    assert len(InspectionType.find_all_inspection_types()) is 0
