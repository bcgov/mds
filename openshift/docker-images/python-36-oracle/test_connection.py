#! /usr/bin/env python
import cx_Oracle

print('test_connection.py')

dsn = 'mds_nris_3'

oracle_db = cx_Oracle.connect(
    user='PROXY_NRIS_MDS_TEMP', password='bgiu68hdl0dsecesqc0g', dsn=dsn, encoding="UTF-8")

print('connected')

cursor = oracle_db.cursor()
cursor.execute("SELECT sys_context('USERENV', 'NETWORK_PROTOCOL') as network_protocol FROM dual")

results = cursor.fetchall()
for result in results:
    print(result)
cursor.close()
