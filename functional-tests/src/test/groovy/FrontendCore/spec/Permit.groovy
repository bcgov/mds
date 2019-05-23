package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.*


@Title("MDS-MineProfile-PermitTab")
@Stepwise
class  PermitSpec extends GebReportingSpec {
    def setup() {
        to MineProfilePage
    }

    def "User can view permit"(){
        when:"I go to the permit tab"
        permitTab.tabSelect.click()

        then:"I should see a list of permit"
        assert permitTab.permit_no.text() != ''
    }

    def "User can create a permit"(){
        //click on add new permit
        //fill out form
        //upload file
        //click add new permit
        //confirm that permit is present
    }

    def "User can upload a doc to a permit"(){
        
    }

    def "User can add an amendment to a permit"(){
        
    }
    
    def "User can add an amalgamate a permit"(){
        
    }

    def "User can edit the status of a permit"(){
        
    }

}
