package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.*
import dataObjects.PartyProfileData


@Title("MDS-MineProfilePage")
@Stepwise
class  ContactInfoSpec extends GebReportingSpec {

    def "Scenario: User can create new mine manager and update mine manager information"(){
        given: "I go to mine profile"
        to MineProfilePage

        when: "I go to contact tab"
        contactInfoTab.tabSelect.click()

        then: "I am on the contact tab"
        assert contactInfoTab.header != null
    }
}
