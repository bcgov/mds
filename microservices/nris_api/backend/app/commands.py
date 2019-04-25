import click

from app.extensions import db
from app.nris.models.test_model import FactorialRecord


def register_commands(app):
    @app.cli.command()
    @click.argument('n')
    def f(n):
        n = int(n)
        tmp = FactorialRecord.query.filter_by(input_val=n).first()
        if tmp:
            ret_val = tmp.output_val
            print("BEEN THERE DONE THAT")
        else:
            ret_val = _factorial(n)
            new_fr = FactorialRecord(input_val=n, output_val=ret_val)
            print('THIS IS NEW')
            db.session.add(new_fr)
            db.session.commit()
        print(ret_val)

    def _factorial(n):
        if n < 2:
            return 1
        return _factorial(n - 1) + n