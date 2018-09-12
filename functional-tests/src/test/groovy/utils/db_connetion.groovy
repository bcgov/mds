package utils

import groovy.sql.Sql


// class DB_connection {
//     static final db = [
//     url:"jdbc:postgresql://localhost/mds_functional_test",
//     user:"test",
//     password:"test",
//     driver:"org.postgresql.Driver"
//     ]   
//     static final Sql MDS_FUNCTIONAL_TEST = Sql.newInstance(db.url,db.user,db.password,db.driver)
// }

class DB_connection {
    static final db = [
    url:"jdbc:postgresql://localhost/mds",
    user:"test",
    password:"test",
    driver:"org.postgresql.Driver"
    ]   
    static final Sql MDS_FUNCTIONAL_TEST = Sql.newInstance(db.url,db.user,db.password,db.driver)
}