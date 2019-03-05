package utils

import groovy.transform.SourceURI
import java.nio.file.Path
import java.nio.file.Paths

import io.github.cdimascio.dotenv.Dotenv

class Const{
    @SourceURI
    static URI sourceUri
    static Path scriptLocation = Paths.get(sourceUri)
    static Dotenv dotenv = Dotenv.configure().directory("./").ignoreIfMalformed().ignoreIfMissing().load()
    static systemEnv = System.getenv()
    static final String MINE_NAME   = "MINETEST",
                        MINE_NUMBER = "BLAH0000",
                        MINE_LAT    = "48"      ,
                        MINE_LONG   = "-125"    ,
                        MINE_GUID   = "9c1b63b6-ccfb-48b0-be85-3cb3c5d1a276",
                        TENURE      = "1234567" ,
                        TSF_NAME    = "TestTSF" ,
                        IDIR_USERNAME = dotenv['IDIR_USERNAME'] ? dotenv['IDIR_USERNAME'] : systemEnv['IDIR_USERNAME'],
                        IDIR_PASSWORD = dotenv['IDIR_PASSWORD'] ? dotenv['IDIR_PASSWORD'] : systemEnv['IDIR_PASSWORD'],
                        DB_HOST = dotenv['DB_HOST'] ? dotenv['DB_HOST'] : systemEnv['DB_HOST'],
                        DB_NAME = dotenv['DB_NAME'] ? dotenv['DB_NAME'] : systemEnv['DB_NAME'],
                        DB_USER = dotenv['DB_USER'] ? dotenv['DB_USER'] : systemEnv['DB_USER'],
                        DB_PASS = dotenv['DB_PASS'] ? dotenv['DB_PASS'] : systemEnv['DB_PASS'],
                        TEST_FILE_CONTENT =  "The quality of mercy is not strained.",
                        TEST_FILE_NAME = "test.odt",
                        DOWNLOAD_PATH=scriptLocation.getParent().getParent().getParent().toString()+"/tempStorage"
}