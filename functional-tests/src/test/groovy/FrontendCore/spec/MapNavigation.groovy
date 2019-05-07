package spec

import geb.spock.GebReportingSpec
import spock.lang.*

import pages.Dashboard
import pages.MineProfilePage
import utils.*
import dataObjects.MineProfileData


@Title("Map Navigation Page")
@Stepwise
class  MapNavigationSpec extends GebReportingSpec {
    static NAME_GOOD = "Mine-Test ABC"
    static NAME_GOOD_TWO = "Mine-Test DEF"
    static STATUS    = "Closed / Orphaned / Long Term Maintenance"
    static LAGTITUTE = "52.6565"
    static LONGTITUE = "124.2342"
    static NOTES     = "This is a test mine"
    static NULL      = ""
    static BAD_NAME_1= "r2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQR"
    static BAD_NAME_2= "ab"



    def "Scenario: User is able to navigate to main map."(){
        given: "I go to the Dashboard Page"
        to Dashboard

        when: "Loading is finished and I click the map tab."
        mapTab.tabSelect.click()
        sleep(500)
        // createMineButton_Dashboard.click()

        then: "The map should load"
        // toastMessage == "Successfully created: " + NAME_GOOD

        
    }

}
