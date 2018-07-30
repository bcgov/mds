package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*

//variables
ID_GOOD = "Regional-123"
ID_LONG = "Regional-12345678"

NULL_STRING = ""

NAME_GOOD = "Gibraltar"
NAME_LONG = "RGN945v88nTk0LOUk5d5WlQgbl5209VjZMEOmGobwppXO7QPHflw5jaQHna7"

MSG_SUCCEED = "Success"
MSG_FAIL = "fail"

@Title("MDS-createMineRecord")
@Narrative("At homepage, I can create a mine record given valid mine ID and mine Name")
@see("https://bcmines.atlassian.net/browse/MDS-63")
@Stepwise
class  HomePageTest extends GebReportingSpec {
    def "Scenario 1: User is able to create a mine record given unique MINE-ID and a MIND-Name"(){
        given: "I go to the homepage"
        to HomePage

        when: "I input valie mine ID and name combination"
        createMineRecord(ID_GOOD,NAME_GOOD)

        and: "I should see the successful message"
        toastMessage = MSG_SUCCEED

    }


    def "Scenario 2: Error displayed when the given mine ID is more than 10 char"(){
        given: "I go to the homepage"
        to HomePage

        when: "I input long mine ID"
        createMineRecord(ID_LONG,NAME_GOOD)

        and: "I should see an error message"
        toastMessage = MSG_FAIL
    }

    def "Scenario 3: Error displayed when the given mine name is more than 50 char"(){
        given: "I go to the homepage"
        to HomePage

        when: "I input long mine name"
        createMineRecord(ID_GOOD,NAME_LONG)

        and: "I should see an error message"
        toastMessage = MSG_FAIL
    }

    def "Scenario 4: Error displayed if mineID is null"(){
        given: "I go to the homepage"
        to HomePage

        when: "I do not give a mine ID"
        createMineRecord(NULL_STRING,NAME_GOOD)

        and: "I should see an error message"
        toastMessage = MSG_FAIL
    }

    def "Scenario 5: Error displayed if mine name is null"(){
        given: "I go to the homepage"
        to HomePage

        when: "I do not give a mine name"
        createMineRecord(NAME_GOOD,NULL_STRING)

        and: "I should see an error message"
        toastMessage = MSG_FAIL
    }


    def "Scenario 6: Error displayed if the given mineID already exists in the DB"(){
        given: "I go to the homepage"
        to HomePage

        when: "I input a duplicate mine id"
        createMineRecord(NAME_GOOD,NAME_LONG)

        and: "I should see an error message"
        toastMessage = MSG_FAIL
    }
}
