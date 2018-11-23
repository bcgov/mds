package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.*
import dataObjects.ManagerProfileData


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
        assert permitTab.permit_date.text() != ''
    }


}
