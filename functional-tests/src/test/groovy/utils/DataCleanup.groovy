package utils

import geb.spock.GebReportingSpec
import spock.lang.*


import utils.DbConnection


@Narrative("Cleanup Test Mine Record")
class  DataCleanup extends GebReportingSpec {
    def cleanupSpec() {
        println "Step 3 of 3: Cleaning test data"
        DbConnection.MDS_FUNCTIONAL_TEST.execute(new File('src/test/groovy/Data/data_deletion.sql').absolutePath.text)
    }
}