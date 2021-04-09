#!/bin/bash
if [ "$ETL_MODE" == "1" ]
then
    cd /opt/app-root && APP_FILE=/opt/app-root/src/run_etl.py /usr/libexec/s2i/run
else
    uwsgi uwsgi.ini
fi
