from app.extensions import db
from app.nris.utils.base_model import Base


class AttendeeType(Base):
    __tablename__ = "attendee_type"
    __table_args__ = {
        'comment': 'Lookup table that provides types of Attendees on an Inspection; i.e. Inspector, Management, FirstNations.'}

    attendee_type_id = db.Column(db.Integer, primary_key=True)
    attendee_type = db.Column(db.String(256))

    def __repr__(self):
        return f'<AttendeeType attendee_type_id={self.attendee_type_id} attendee_type={self.attendee_type}>'

    @classmethod
    def find_all_attendee_types(cls):
        return cls.query.all()
