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

    def "Scenario: User is able to create a mine record given a valid MIND-Name"(){
        given: "I go to the DashboardPage"
        to DashboardPage

        when: "I click the create a mine button"
        createMineButton.click()

        then: "I go to the mine record form page"
        at CreateMineForm

        when: "I input valid mine name"
        createMineRecord(NAME_GOOD)

        then: "I should see the successful message"
        toastMessage == "Successfully created: " + NAME_GOOD
    }


    def "Scenario: Error displayed when the given mine name is more than 60 char"(){
        given: "I go to the DashboardPage"
        to DashboardPage

        when: "I click the create a mine button"
        createMineButton.click()

        then: "I go to the mine record form page"
        createMineForm.header == "Create A Mine Record"

        when: "I input invalid mine name"
        createMineForm.createMineRecord(badName)
        println scenario

        then: "I should see a warning"
        createMineForm.errorMessage == errorMessage

        where: 
        scenario    |badName    ||errorMessage
        "long name" |"r2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQR" || "Must be 60 characters or less"
        "short name"|"ab"       ||"Must be 3 characters or more"
        "null"      |""         ||"This is a required field"

    }


    def "Scenario: User can view the created record on Dashboard"(){
        when: "I go to the DashboardPage"
        to DashboardPage

        then: "I should see the created record on the Dashboard"
        sleep(1000)
        assert validation(NAME_GOOD) == true
    }

    
}
