package spec

import geb.spock.GebReportingSpec
import spock.lang.*

import pages.Dashboard
import pages.MineProfilePage
import utils.*
import dataObjects.MineProfileData

//TODO: FIX MAP CACHING ISSUES FOR THIS TEST TO PASS
@Title("Map Navigation Page")
@Stepwise
class  MapNavigationSpec extends GebReportingSpec {

    def "Scenario: User is able to navigate to main map."(){
        given: "I go to the Dashboard Page"
        to Dashboard

        when: "Loading is finished and I click the map tab."
        at Dashboard
        mapTabSelect.mapTab.click()
        waitFor() {mapPin[0] }
        interact { 
            moveToElement(mapPin[0])
            click(mapPin[0])
        }
        
        //TODO: VERIFY CONTENT OF POP UP MODAL
        viewMineButton.click()

        then: "The user should navigate to the mine profile"
        at MineProfilePage
        
    }

}
