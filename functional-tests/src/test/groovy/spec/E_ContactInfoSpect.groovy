package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.* 
import dataObjects.managerProfileData

 
@Title("MDS-MineProfilePage")
@Stepwise
class  E_ContactInfoSpect extends GebReportingSpec {
 
    def "Scenario: User can create new mine manager and update mine manager information"(){
        given: "I go to mine profile"
        to MineProfilePage

        when: "I go to contact tab"
        contactInfoTab.tabSelect.click() 

        and: "I create a new mine manager and update mine manager with the manager just created"
        contactInfoTab.modifyManager(manager)
        waitFor {toastMessage!= null }

        then: "Should see successful message"
        assert toastMessage == "Successfully updated the manager of ${Const.MINE_NAME}"
        
        then: "I can see the manager information get updated"
        contactInfoTab.mineManagerCheck(manager) == [true,true]

        where:
        scenario        |manager 
        "add manager"   |new managerProfileData ("MANAGER", "TEST", "123-456-7890", "111", "abc@test.com","2017-08-04")
        "update manager"|new managerProfileData ("TEST2","mine","123-494-0909","222","test@test.com","2018-01-01") 
    }
}
