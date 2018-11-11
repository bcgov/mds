package utils

import geb.spock.GebReportingSpec
import spock.lang.*


import utils.DbConnection


@Narrative("Generate Test Mine Record")
class  DataInit extends GebReportingSpec {

    def setupSpec(){
        println "Step 1 of 3: Creating test mine record:"
        try {
            def creationFilePath = new File('src/test/groovy/data/data_creation.sql').absolutePath
            DbConnection.MDS_FUNCTIONAL_TEST.execute(new File(creationFilePath).text)
        } catch (org.postgresql.util.PSQLException e) {
            println ">>>>> Record already exists. >>>>>"
        }
        println "Step 2 of 3: Test execution on BaseURL: ${baseUrl}"
    }
}