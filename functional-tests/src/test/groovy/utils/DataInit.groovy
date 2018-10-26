package utils

import geb.spock.GebReportingSpec
import spock.lang.*

 
import utils.DB_connection

 
@Narrative("Generate Test Mine Record") 
class  DataInit extends GebReportingSpec {
    
    def setupSpec(){
        println "Step 1 of 3: Creating test mine record:"
        try {
            DB_connection.MDS_FUNCTIONAL_TEST.execute(new File('src/test/groovy/Data/data_creation.sql').text)
        } catch (org.postgresql.util.PSQLException e) {
            println ">>>>> Record already exists. >>>>>"
        }
        println "Step 2 of 3: Test execution on BaseURL: ${baseUrl}"
    }
}