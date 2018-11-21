package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.*
import dataObjects.ManagerProfileData
import dataObjects.PermitteeProfileData


@Title("MDS-MineProfilePage")
@Stepwise
class  ContactInfoSpec extends GebReportingSpec {

    def "Scenario: User can create new mine manager and update mine manager information"(){
        given: "I go to mine profile"
        to MineProfilePage

        when: "I go to contact tab"
        contactInfoTab.tabSelect.click()

        and: "I create a new mine manager and update mine manager with the manager just created"
        contactInfoTab.modifyManager(manager)
        waitFor {toastMessage!= null }

        then: "Should see successful message"
        assert toastMessage

        // Wait for the changes to propogate through the database and react state
        sleep(1000)

        then: "I can see the manager information get updated"
        contactInfoTab.mineManagerCheck(manager) == [true,true]

        where:
        scenario        |manager
        "add manager"   |new ManagerProfileData ("MANAGER", "TEST", "123-456-7890", "111", "abc@test.com","2017-08-04")
        "update manager"|new ManagerProfileData ("TEST2","mine","123-494-0909","222","test@test.com","2018-01-01")
    }

    def "Scenario: User can update a mine permittee in MDS with a party already in the database"(){
        given: "I go to mine profile"
        to MineProfilePage

        when: "I go to contact tab and open the permittee modal"
        contactInfoTab.tabSelect.click()
        contactInfoTab.updatePermitteeButton.click()

        and: "I update the mine permittee"
        contactInfoTab.updatePermittee(party)
        waitFor {toastMessage!= null}

        then: "Should see successful message"
        assert toastMessage

        where:
        scenario          |party
        "update permittee"|new PermitteeProfileData ("Amine", "Test", "123-456-7890", "222", "def@test.com","2018-01-01")
    }

    def "Scenario: User can create a new party in MDS and add it to a mine as a permittee"(){
        given: "I go to mine profile"
        to MineProfilePage

        when: "I go to contact tab and open the permittee modal"
        contactInfoTab.tabSelect.click()
        contactInfoTab.updatePermitteeButton.click()

        and: "I create a new party"
        contactInfoTab.createParty(party)
        waitFor {toastMessage!= null}

        then: "Should see successful message"
        assert toastMessage

        and: "I add the new party as a mine permittee"
        contactInfoTab.updatePermittee(party)
        waitFor {toastMessage!= null}

        then: "Should see successful message"
        assert toastMessage

        where:
        scenario          |party
        "create permittee"|new PermitteeProfileData ("TEST", "PERMITTEE", "123-456-7890", "222", "def@test.com","2017-08-04")
    }
}
