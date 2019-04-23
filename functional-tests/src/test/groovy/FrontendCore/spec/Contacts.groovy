package spec

import geb.spock.GebReportingSpec
import spock.lang.*

import pages.*
import utils.*
import modules.*
import dataObjects.MineContactDataOne
import dataObjects.MineContactDataTwo

@Title("MDS-Core-Contacts")
@Stepwise
class  Contacts extends GebReportingSpec {
    //Constants for tests
    static NULL = ""
    static input2 = new MineContactDataTwo(NULL,"A Mine",NULL,NULL)

    def "Scenario: User can navigate to the contacts page."(){
        given: "I am on the homepage"
        to Dashboard

        when: "I clicke on the contact page link."
        contactPageButton.click()

        then: "I am on the contact tab"
        at ContactsPage
    }

    def "Scenario: User can create a person contact."(){
        given: "I am on the contact page."
        to ContactsPage

        when: "I clicke on the contact page link."
        createContactButton.click()

        and: "I fill out the first form."
        createContactFormOne.createContactFormOne(input)
        createContactFormAddRole.createContactFormAddRole()
        createContactFormTwo.createContactFormTwo(input2)
// call the form method that fills out page 1
// call the form method that fills out page 2
        then: "I am on the contact tab"
        at ContactsPage

        where:
        scenario                            | input
        "Given minimal info for person"     |new MineContactDataOne(NULL,'Jon','Sharman','Jon@email.com','1234567891',NULL,NULL,NULL,NULL,NULL,NULL,NULL)
                   
    }

    // def "Scenario: User can create a company contact."(){
       
    // }

    // def "Scenario: User can use advanced contact search."(){
       
    // }
}
