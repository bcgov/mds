package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.MineProfilePage
import utils.Const


@Title("MDS-MineProfilePage")
@Stepwise
class  Tenure extends GebReportingSpec {
    def setup(){
        given: "User go to the mine profile page and click the Tenure tab"
        to MineProfilePage
        tenureTab.tabSelect.click()
    }

    def "Scenario: User can add tenure number"(){
        when: "User open the update tenure form and add a new tenure number"
        tenureTab.addTenure(Const.TENURE)
        waitFor {toastMessage!= null }

        and: "see successful message"
        toastMessage == "Successfully updated: ${Const.MINE_NAME}"

        then: "User can see the updated tenure number list"
        tenureTab.tenureUpdated(Const.TENURE) == true
    }

}
