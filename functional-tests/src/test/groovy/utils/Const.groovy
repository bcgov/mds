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
    static final String CONTACT_FIRST_NAME = "Wreckit",
                        CONTACT_LAST_NAME = "Ralph",
                        CONTACT_FULL_NAME = "Ralph, Wreckit",
                        MINE_NAME_2 = "!!MINE2TEST",
                        MINE_ROLE_2 = "Mine Manager",
                        MINE_NAME   = "!!MINETEST",
                        MINE_NUMBER = "BLAH0000",
                        MINE_LAT    = "48"      ,
                        MINE_LONG   = "-125"    ,
                        MINE_GUID   = "4afafc66-d294-4765-b5c8-8eb77630cb56",
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
                        DOWNLOAD_PATH=scriptLocation.getParent().getParent().getParent().toString()+"/tempStorage",
                        MINESPACE_URL = dotenv['MINESPACE_URL'] ? dotenv['MINESPACE_URL'] : systemEnv['MINESPACE_URL'],
                        MINESPACE_EMAIL = "test@test.com",
                        PERMIT_DESCRIPTION = "A fancy description",
                        PERMIT_NUMBER="666666",
                        AMALGAMATION_DESCRIPTION = "A fancy amalgamation description"
                        
}