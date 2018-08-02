package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*



@Title("MDS-createMineRecord")
@Narrative("At homepage, I can create a mine record given valid mine Name")
//@see("https://bcmines.atlassian.net/browse/MDS-63")
@Stepwise
class  HomePageTest extends GebReportingSpec {
    //variables
    static NAME_NULL = ""
    static NAME_GOOD = "Brucejack"
    static NAME_LONG = "r2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQR"//61 chars

 

    def "Scenario: User is able to create a mine record given a  valid MIND-Name"(){
        given: "I go to the homepage"
        to HomePage

        when: "I click the create a mine button"
        createMineButton.click()

        then: "I go to the mine record form page"
        at CreateAMinePage

        when: "I input valid mine name"
        createMineRecord(NAME_GOOD)

        then: "I should see the successful message"
        toastMessage == "Successfully created: " + NAME_GOOD
    }

    def "Scenario: User can view the created record on Dashboard"(){
        given: "I go to the homepage"
        to HomePage

        when: "I click the dashboard button"
        dashboardButton.click()

        then: "On Dashboard"
        at Dashboard

        and: "I should see the created record on the Dashboard"
        sleep(5000)
        validation(NAME_GOOD) == [true,true]


    }


    def "Scenario: Error displayed when the given mine name is more than 60 char"(){
        given: "I go to the homepage"
        to HomePage

        when: "I click the create a mine button"
        createMineButton.click()

        then: "I go to the mine record form page"
        at CreateAMinePage

        when: "I input long mine name"
        createMineRecord(NAME_LONG)

        then: "I should see an error message"
        toastMessage == "Specified name cannot exceed 60 characters."
    }


    def "Scenario: Error displayed if mine name is null"(){
        given: "I go to the homepage"
        to HomePage

        when: "I click the create a mine button"
        createMineButton.click()

        then: "I go to the mine record form page"
        at CreateAMinePage

        when: "I do not give a mine name"
        createMineRecord(NAME_NULL)

        then: "I should see an error message"
        toastMessage == "Must specify a mine name."
    }



}
