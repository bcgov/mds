package utils

import groovy.sql.Sql
import io.github.cdimascio.dotenv.Dotenv

 

class DB_connection {
    static Dotenv dotenv = Dotenv.configure().directory("./").load()
    static final db = [
        url:dotenv.get("DB_URL"),
        user:dotenv.get("DB_USER"),
        password:dotenv.get("DB_PASS"),
        driver:"org.postgresql.Driver"
    ]   
    static final Sql MDS_FUNCTIONAL_TEST = Sql.newInstance(db.url,db.user,db.password,db.driver)
}