# Scans through all files in the models folder and automatically imports them. This allows alembic to be aware
# of and create all tables, even if a resource does not not reference a specific model.
from os.path import dirname, basename, isfile, join
import glob
modules = glob.glob(join(dirname(__file__), "*.py"))
__all__ = [basename(f)[:-3] for f in modules if isfile(f) and not f.endswith('__init__.py')]
