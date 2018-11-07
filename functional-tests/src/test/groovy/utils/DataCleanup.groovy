package utils

import geb.spock.GebReportingSpec
import spock.lang.*

  
import utils.DB_connection

 
@Narrative("Cleanup Test Mine Record") 
class  DataCleanup extends GebReportingSpec {
    def cleanupSpec() {
        println "Step 3 of 3: Cleaning test data" 
        DB_connection.MDS_FUNCTIONAL_TEST.execute(new File('src/test/groovy/Data/data_deletion.sql').text)
    }
}