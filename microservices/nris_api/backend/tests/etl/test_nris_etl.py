import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.nris.etl.nris_etl import etl_nris_data
from app.nris.utils.base_model import Base


from app.nris.models.inspection_type import InspectionType
# TODO: import the massive raw nris_etl data strings

class TestEtl(unittest.TestCase):
    engine = create_engine('sqlite:///:memory:')
    Session = sessionmaker(bind=engine)
    session = Session()

    def setUp(self):
        Base.metadata.create_all(self.engine)
        self.session.add(InspectionType(1, 'TypeA', 'This is the first test type'))
        self.session.commit()

    def tearDown(self):
        Base.metadata.drop_all(self.engine)

    def test_etl_nris_data(self):
        assert len(self.session.query(InspectionType).all()) is 1
