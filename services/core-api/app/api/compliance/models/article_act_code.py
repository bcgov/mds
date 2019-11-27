from datetime import datetime
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base


class ArticleActCode(Base):
    __tablename__ = 'article_act_code'
    article_act_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    expiry_date = db.Column(db.DateTime)
    update_timestamp = db.Column(db.DateTime,
                                 nullable=False,
                                 default=datetime.utcnow,
                                 onupdate=datetime.utcnow)

    def __repr__(self):
        return '<ArticleActCode %r>' % self.article_act_code
