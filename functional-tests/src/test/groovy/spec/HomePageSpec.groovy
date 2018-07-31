package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*

//variables


NAME_NULL = ""
NAME_GOOD = "Gibraltar"
NAME_LONG = "RGN945v88asdfasfnTk0LOUk5d5WlQgbl5209VjZMEOmGobwppXO7QPHflw5jaQHna7"

MSG_SUCCEED = "Success"
MSG_FAIL = "fail"

@Title("MDS-createMineRecord")
@Narrative("At homepage, I can create a mine record given valid mine Name")
@see("https://bcmines.atlassian.net/browse/MDS-63")
@Stepwise
class  HomePageTest extends GebReportingSpec {
    def "Scenario: User is able to create a mine record given a  valid MIND-Name"(){
        given: "I go to the homepage"
        to HomePage

        then: "I can see the header'"
        header.text === "Create A Mine Record"


        when: "I input valid mine name"
        createMineRecord(NAME_GOOD)

        then: "I should see the successful message"
        toastMessage === MSG_SUCCEED

        when: "I click the Dashboard button"
        dashboardButton.click()

        then: "I should see the Dashboard"
        at Dashboard

        and: "I should see the created record on the Dashboard"
        header.text === "Mine Dashboard"
        mineRecordExists(NAME_GOOD)


    }

/*
    def "Scenario: Error displayed when the given mine name is more than 50 char"(){
        given: "I go to the homepage"
        to HomePage

        when: "I input long mine name"
        createMineRecord(NAME_LONG)

        and: "I should see an error message"
        toastMessage = MSG_FAIL
    }


    def "Scenario: Error displayed if mine name is null"(){
        given: "I go to the homepage"
        to HomePage

        when: "I do not give a mine name"
        createMineRecord(NAME_NULL)

        and: "I should see an error message"
        toastMessage = MSG_FAIL
    }

    */

}
