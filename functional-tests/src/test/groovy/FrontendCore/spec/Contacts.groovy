package spec

import geb.spock.GebReportingSpec
import spock.lang.*

import pages.*
import utils.*
import modules.*
import dataObjects.MineContactDataOne
import dataObjects.MineContactDataTwo
import utils.Const

@Title("MDS-Core-Contacts")
class  Contacts extends GebReportingSpec {
    //Constants for tests
    static NULL = "" 
    static CONTACT_EMAIL = 'jon@email.ca'
    static CONTACT_PHONE_NUMBER = "1234567980"
    static CONTACT_FIRST_NAME_2 = "Zydrunas"
    static CONTACT_LAST_NAME_2 = "Zavicus"
    static CONTACT_FULL_NAME_2 = "Zavicus, Zydrunas"
    static input1 = new MineContactDataOne(NULL, Const.CONTACT_FIRST_NAME,Const.CONTACT_LAST_NAME,
                CONTACT_EMAIL, CONTACT_PHONE_NUMBER,NULL,NULL,NULL,NULL,NULL,NULL,NULL)        
    static input2 = new MineContactDataTwo(Const.MINE_ROLE_2,Const.MINE_NAME_2)
    
    
    def "Scenario: User can navigate to the contacts page."(){
        given: "I am on the homepage"
        to Dashboard

        when: "I clicke on the contact page link."
        contactPageButton.click()

        then: "I am on the contact tab"
        at ContactsPage
    }

    def "Scenario: User can filter out contacts with contact search."(){
        given: "I am on the contact page."
        to ContactsPage

        when: "I search for a contact."
        searchBoxFirstName = CONTACT_FIRST_NAME_2
        searchBoxLastName  = CONTACT_LAST_NAME_2
        applyFilterButton.click()

        then: "I should get single person with that name."
        contactTableContent.text()startsWith( CONTACT_FULL_NAME_2)
                      
    }

    def "Scenario: User can create a person contact and add them as a minemanger."(){
        given: "I am on the contact page."
        to ContactsPage

        when: "I click on the contact page link."
        createContactButton.click()

        and: "I fill out the first form."
        createContactForm.createContactFormOne(input1)
        createContactForm.createContactFormTwo(input2)
        waitFor {toastMessage != null}

        then: "I should get a successful message"
        successfulToastMessage != null
        contactTableNameOne != null
    }
   
}
