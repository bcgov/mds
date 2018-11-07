package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.* 
import dataObjects.managerProfileData

 
@Title("MDS-MineProfile-PermitTab")
@Stepwise
class  D_PermitSpec extends GebReportingSpec {
    def setup() {
        to MineProfilePage
    }

    def "User can view permit"(){
        when:"I go to the permit tab"
        permitTab.tabSelect.click()

        then:"I should see a list of permit" 
        assert permitTab.permit_no[2].text() == 'BLAHPER-02'
        assert permitTab.permit_no[3].text() == 'BLAHPER-01'
        assert permitTab.permit_date[2].text() == '2003-03-03'
        assert permitTab.permit_date[3].text() == '2002-02-02'
    }
 

}
