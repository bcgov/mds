#! /usr/bin/env python

import os
import cx_Oracle

print('test_connection.py')

# dsn = cx_Oracle.makedsn(
#     os.getenv('NRIS_DB_HOSTNAME'),
#     os.getenv('NRIS_DB_PORT'),
#     service_name=os.getenv('NRIS_DB_SERVICENAME'))

dsn = f'(DESCRIPTION=(ADDRESS=(PROTOCOL=TCPS)(HOST=nrc{os.getenv("NRIS_DB_HOSTNAME")})(PORT={os.getenv("NRIS_DB_PORT")}))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME={os.getenv("NRIS_DB_SERVICENAME")}))(SECURITY=(ssl_server_cert_dn="{os.getenv("NRIS_SERVER_CERT_DN")}")))'

oracle_db = cx_Oracle.connect(
    user=os.getenv('NRIS_DB_USER'), password=os.getenv('NRIS_DB_PASSWORD'), dsn=dsn)

print('connected')

cursor = oracle_db.cursor()
cursor.execute("SELECT sys_context('USERENV', 'NETWORK_PROTOCOL') as network_protocol FROM dual")

results = cursor.fetchall()
for result in results:
    print(result)
cursor.close()
