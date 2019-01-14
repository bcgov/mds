package utils

import geb.spock.GebReportingSpec
import spock.lang.*


import utils.DbConnection


@Narrative("Cleanup Test Mine Record")
class  DataCleanup extends GebReportingSpec {
    def cleanupSpec() {
        println "Cleaning test data"
        try {
            def cleanupScriptPath = new File('src/test/groovy/data/data_deletion.sql').absolutePath
            DbConnection.MDS_FUNCTIONAL_TEST.execute(new File(cleanupScriptPath).text)
        } catch (org.postgresql.util.PSQLException e) {
            println ">>>>>>Deletion Failed. Check logs below for detailed error message."
            println e
        }
    }
}