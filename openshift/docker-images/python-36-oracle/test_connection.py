#! /usr/bin/env python

import cx_Oracle
import os

print('test_connection.py')

dsn = 'mds_nris_test'
# dsn = cx_Oracle.makedsn(
#     os.getenv('NRIS_DB_HOSTNAME'),
#     os.getenv('NRIS_DB_PORT'),
#     service_name=os.getenv('NRIS_DB_SERVICENAME'))
oracle_db = cx_Oracle.connect(user='luke_test', password='luketest12#', dsn=dsn, encoding="UTF-8")
# oracle_db = cx_Oracle.connect(
#     user=os.getenv('NRIS_DB_USER'),
#     password=os.getenv('NRIS_DB_PASSWORD'),
#     dsn=dsn,
#     encoding="UTF-8")

print('connected')

cursor = oracle_db.cursor()
cursor.execute("SELECT sys_context('USERENV', 'NETWORK_PROTOCOL') as network_protocol FROM dual")

results = cursor.fetchall()
for result in results:
    print(result)
cursor.close()
