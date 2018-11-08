package utils

import groovy.sql.Sql
import io.github.cdimascio.dotenv.Dotenv



class DbConnection {
    static Dotenv dotenv = Dotenv.configure().directory("./").load()
    DB_URL=jdbc:postgresql://localhost/mds
    static dbUrl = "jdbc:postgresql://${dotenv.get("DB_HOST")}/${dotenv.get("DB_NAME")}"
    static final db = [
        url:dbUrl,
        user:dotenv.get("DB_USER"),
        password:dotenv.get("DB_PASS"),
        driver:"org.postgresql.Driver"
    ]
    static final Sql MDS_FUNCTIONAL_TEST = Sql.newInstance(db.url,db.user,db.password,db.driver)
}