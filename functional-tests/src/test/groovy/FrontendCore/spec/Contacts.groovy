package spec

import geb.spock.GebReportingSpec
import spock.lang.*

import pages.*
import utils.*

@Title("MDS-Core-Contacts")
@Stepwise
class  Contacts extends GebReportingSpec {

    def "Scenario: User can navigate to the contacts page."(){
        given: "I am on the homepage"
        to Dashboard

        when: "I clicke on the contact page link."
        contactPageButton.click()

        then: "I am on the contact tab"
        at ContactsPage
    }

    def "Scenario: User can create a contact."(){
        given: "I am on the contact page."
        to ContactsPage

        when: "I clicke on the contact page link."
        createContactButton.click()

        then: "I am on the contact tab"
        at ContactsPage
    }
}
