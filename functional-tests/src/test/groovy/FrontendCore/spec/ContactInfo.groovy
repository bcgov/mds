package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.*


@Title("MDS-MineProfilePage")
@Stepwise
class  ContactInfoSpec extends GebReportingSpec {

    def setupSpec() {
        Thread.sleep(5)
    }

    def "Scenario: User can create new mine manager and update mine manager information"(){
        given: "I go to mine profile"
        to MineProfilePage

        when: "I go to contact tab"
        contactInfoTab.tabSelect.click()

        then: "I am on the contact tab"
        assert contactInfoTab.activeTab == "Contact Information"
    }
}
