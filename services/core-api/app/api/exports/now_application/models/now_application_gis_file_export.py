from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.inspection import inspect

from app.api.utils.models_mixins import Base
from app.extensions import db


class NowApplicationGisFileExport(Base):
    __tablename__ = 'now_application_gis_file_export_view'

    # TODO: Specify additional params (e.g., nullable) and proper data types
    # Notice of Work General
    now_application_guid = db.Column(db.String, primary_key=True)
    now_number = db.Column(db.String, nullable=False)
    file_name = db.Column(db.String, nullable=False)
    download_url = db.Column(db.String, nullable=False)

    def csv_row(self):
        model = inspect(self.__class__)
        return [str(getattr(self, c.name) or "") for c in model.columns]
