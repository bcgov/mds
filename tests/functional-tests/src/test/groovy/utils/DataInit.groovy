package utils

import geb.spock.GebReportingSpec
import spock.lang.*


import utils.DbConnection


@Narrative("Generate Test Mine Record")
class  DataInit extends GebReportingSpec {

    def setupSpec(){
        println "Creating test mine record:"
        try {
            def creationFilePath = new File('src/test/groovy/data/data_creation.sql').absolutePath
            DbConnection.MDS_FUNCTIONAL_TEST.execute(new File(creationFilePath).text)
        } catch (org.postgresql.util.PSQLException e) {
            println ">>>>>>Creation Failed. Check logs below for detailed error message."
            println e
        }
        println "Test execution on BaseURL: ${baseUrl}"
    }
}