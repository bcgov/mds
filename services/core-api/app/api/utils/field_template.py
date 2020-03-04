class FieldTemplate():
    field = None
    one_of = None
    dump_only = False

    def __init__(self, field, one_of, dump_only=False):
        self.field = field
        self.one_of = one_of
        self.dump_only = dump_only