from app.nris.etl.nris_etl import etl_nris_data
from app.nris.models.inspection_type import InspectionType
# TODO: load anonymized raw data into temp db


def test_etl_nris_data(session):
    etl_nris_data()
    session.add(InspectionType(1, 'TypeA', 'This is the first test type'))
    assert len(InspectionType.find_all_inspection_types()) is 1


def test_data_does_not_persist(session):
    assert len(InspectionType.find_all_inspection_types()) is 0
