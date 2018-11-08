package utils

import groovy.sql.Sql
import utils.Const

class DbConnection {
    static dbUrl = "jdbc:postgresql://${Const.DB_HOST}/${Const.DB_NAME}"
    static final db = [
        url:dbUrl,
        user:Const.DB_USER,
        password:Const.DB_PASS,
        driver:"org.postgresql.Driver"
    ]
    static final Sql MDS_FUNCTIONAL_TEST = Sql.newInstance(db.url,db.user,db.password,db.driver)
}