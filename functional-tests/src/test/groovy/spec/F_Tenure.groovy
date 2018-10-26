package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.MineProfilePage
import utils.Const 

 
@Title("MDS-MineProfilePage")
@Stepwise
class  F_Tenure extends GebReportingSpec {
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

    def "Scenario: User can not add tenure number if the given tenure is invalid"(){
        when: "Tenure number is not in acceptable format"
        tenureTab.addTenure(bad_tenure)
        println "Scenario: "+scenario

        and:"User see warning message"
        tenureTab.updateTenureForm.warningMessage == warning

        then: "Refresh the page, tenure number list stays the same"
        tenureTab.tenureUpdated(bad_tenure) == false

        where:
        scenario        |bad_tenure    |warning
        "short tenure"  |"123456"      |"Must be 7 characters long"
        "long tenure"   |"123456677998"|"Must be 7 characters long"
        "contains non-numerical value" | "1234cha" | "Input must be a number"
    }
 
}
