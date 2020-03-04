# this class is designed to be a placeholder for marshmallow field values on a schema.
# if the validator for the schema field requires data to be queried this can be used
# in place to defer the creation of the field and its validator.


class FieldTemplate():
    field = None
    one_of = None
    dump_only = False

    def __init__(self, field, one_of, dump_only=False):
        self.field = field
        self.one_of = one_of
        self.dump_only = dump_only