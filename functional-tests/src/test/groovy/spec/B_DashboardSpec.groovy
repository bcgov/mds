package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
 



@Title("MDS-DashboardPage")
@Narrative("At DashboardPage, I can view mine records and create a new one")
@Stepwise
class  B_DashboardSpec extends GebReportingSpec {
    //variables
    static NAME_GOOD = "Trend-Roman"
    def selectedMine = ["",""]

    def "Scenario: User is not able to create a mine record given an invalid MIND-Name"(){
        given: "I go to the Dashboard Page"
        to Dashboard

        when: "I click the create a mine button"
        createMineButton.click()

        then: "Create a mine form is displayed"
        createMineForm.header == "Create A Mine Record"
        println scenario

        when: "I input valid mine name"
        createMineForm.createMineRecord(mine_name)

        then: "I should see the successful message"
        createMineForm.errorMessage == expectedMessage

        where:
        scenario    |mine_name  ||expectedMessage
        "null name" |""         ||"This is a required field"
        "long name" |"r2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQR"    ||"Must be 60 characters or less"
        "short name"|"a1"       ||"Must be 3 characters or more"
    }
 
    def "Scenario: User is able to create a mine record given a valid MIND-Name"(){
        given: "I go to the Dashboard Page"
        to Dashboard

        when: "I click the create a mine button"
        createMineButton.click()

        then: "Create a mine form is displayed"
        createMineForm.header == "Create A Mine Record"

        when: "I input valid mine name"
        createMineForm.createMineRecord(NAME_GOOD)

        then: "I should see the successful message"
        toastMessage == "Successfully created: " + NAME_GOOD

    }

    def "Scenario: User can view the created record on Dashboard"(){
        when: "I go to the Dashboard Page"
        to Dashboard

        then: "I should see the created record on the Dashboard"
        sleep(1000)
        assert validation(NAME_GOOD) == true
    }

    
}
