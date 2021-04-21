from app.nris.cli_jobs.nris_jobs import run_nris_etl
from app import create_app

app = create_app()
with app.app_context():
    run_nris_etl()
