package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.MineProfilePage
import utils.Const
import modules.Form_CreateTailings


@Title("MDS-MineProfilePage")
@Stepwise
class Tailings extends GebReportingSpec {
    def setup(){
        given: "User go to the mine profile page"
        to MineProfilePage
    }

    def "Scenario: User adds TSF to a mine"(){
        when: "User clicks the 'Add a TSF' button on the summary page and adds a TSF"
        createTSFDropdown.click()
        createTSFDropdownButton.click()
        tailingsTab.addTailingsForm.addTailings(Const.TSF_NAME)

        and: "see successful message"
        toastMessage == "Successfully added the TSF."

        then: "User can now see the tailings tab"
        assert tailingsTab.tabSelect.displayed == true

        when: "User clicks on the tailings tab"
        tailingsTab.tabSelect.click()
        
        then: "the reports are visible"
        assert tailingsTab.document0Name != null
    }
    
}
