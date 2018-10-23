package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.* 
import dataObjects.managerProfileData

 
@Title("MDS-MineProfilePage")
@Stepwise
class  C_MineProfileSpec extends GebReportingSpec {

    def setupSpec(){
        println ">>>>>>>>> Creating test mine record:"
        DB_connection.MDS_FUNCTIONAL_TEST.execute(new File('src/test/groovy/Data/data_creation.sql').text)
        println ">>>>>>>> Done."
    }

    

    def "Scenario: User can view the mine profile"(){
        when: "I go to the mine profile page for BLAH0000(the test record)"
        to MineProfilePage

        then: "I should see profile of the Mine"
        waitFor {activeTab == "Summary" }      
        assert mineNumber == "Mine ID: "+Const.MINE_NUMBER
        assert mineName == Const.MINE_NAME
        assert latValue.minus("Lat:").startsWith(Const.MINE_LAT)
        assert longValue.minus("Long:").startsWith(Const.MINE_LONG)
    }


    def "Scenario: User can create new mine manager and update mine manager information"(){
        given: "I go to mine profile"
        to MineProfilePage

        when: "I go to contact tab"
        contactInfoTab.click()
        sleep(100)

        and: "I create a new mine manager and update mine manager with the manager just created"
        modifyManager(manager)
        sleep(200)

        then: "Should see successful message"
        assert toastMessage == "Successfully updated the manager of ${Const.MINE_NAME}"
        
        then: "I can see the manager information get updated"
        mineManagerCheck(manager) == [true,true]

        where:
        scenario        |manager 
        "add manager"   |new managerProfileData ("MANAGER", "TEST", "123-456-7890", "111", "abc@test.com","2017-08-04")
        "update manager"|new managerProfileData ("TEST2","mine","123-494-0909","222","test@test.com","2018-01-01") 
    }


    def "Scenario: User can add tenure number"(){
        given: "I go to mine profile"
        to MineProfilePage

        when: "User can update mine record with a new tenure number"
        addTenure(Const.TENURE)

        and: "see successful message"
        toastMessage == "Successfully updated: ${Const.MINE_NAME}"

        then: "User can see the updated tenure number list"
        tenureUpdated(Const.TENURE) == true
    }

    def "Scenario: User can not add tenure number if the given tenure is invalid"(){
        given: "I go to mine profile"
        to MineProfilePage

        when: "Tenure number is not all numerical but not meet length requirement"
        addTenure(bad_tenure)
        println "Scenario: "+scenario

        and:"User see warning message"
        updateTenureForm.warningMessage == warning

        then: "Refresh the page, tenure number list stays the same"
        driver.navigate().refresh()
        tenureUpdated(bad_tenure) == false

        where:
        scenario        |bad_tenure    |warning
        "short tenure"  |"123456"      |"Must be 7 characters long"
        "long tenure"   |"123456677998"|"Must be 7 characters long"
        "contains non-numerical value" | "1234cha" | "Input must be a number"
    }

    def cleanupSpec() {
        println ">>>>>>>> Cleaning test data:"
        DB_connection.MDS_FUNCTIONAL_TEST.execute(new File('src/test/groovy/Data/data_deletion.sql').text)
        println ">>>>>>>> Done."
    }



}
