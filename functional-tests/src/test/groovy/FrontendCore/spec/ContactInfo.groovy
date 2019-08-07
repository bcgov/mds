package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.*


@Title("MDS-MineProfilePage")
@Stepwise
class  ContactInfoSpec extends GebReportingSpec {
    def MineProfileContactPage = new MineProfilePage(url: "mine-dashboard/${Const.MINE_GUID}/mine-information/contacts")
    def setup() {
        to MineProfileContactPage
    }


    def "Scenario: User can create new mine manager and update mine manager information"(){
        when: "I go to mine contact profile page."
        to MineProfilePage

        then: "The add contact button is present."
        assert contactInfoTab.addButton != null
    }
}
