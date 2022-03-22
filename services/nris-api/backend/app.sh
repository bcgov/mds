#!/bin/bash
if [ "$ETL_MODE" == "1" ]
then
    python /app/run_etl.py
else
    uwsgi uwsgi.ini
fi
