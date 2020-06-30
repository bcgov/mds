#! /usr/bin/env python
import cx_Oracle

print('test_connection.py')

# dsn = 'mds_nris_prod_1'

dsn = 'mds_nris_test_1'

cx_Oracle.init_oracle_client(
    lib_dir='/opt/app-root/oracle_bin/instantclient',
    config_dir='/opt/app-root/oracle_bin/instantclient/network/admin')

# oracle_db = cx_Oracle.connect(
#     user='PROXY_NRIS_MDS_TEMP', password='bgiu68hdl0dsecesqc0g', dsn=dsn, encoding="UTF-8")

oracle_db = cx_Oracle.connect(user='luke_test', password='luketest12#', dsn=dsn, encoding="UTF-8")

print('connected')

cursor = oracle_db.cursor()
cursor.execute("SELECT sys_context('USERENV', 'NETWORK_PROTOCOL') as network_protocol FROM dual")

results = cursor.fetchall()
for result in results:
    print(result)
cursor.close()
