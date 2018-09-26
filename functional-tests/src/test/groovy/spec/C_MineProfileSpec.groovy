package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.*

 
@Title("MDS-MineProfilePage")
@Stepwise
class  C_MineProfileSpec extends GebReportingSpec {
  
    static TENURE_BAD =  "1234cha"  

    //manager
    static FirstName = "Vivián"
    static LastName = "Iáoyús"
    static Date = "2017-08-04"

    def setupSpec(){
        println "---------Creating test mine record--------------"
        DB_connection.MDS_FUNCTIONAL_TEST.execute(new File('src/test/groovy/Data/data_creation.sql').text)
    }

    

    def "Scenario: User can view the mine profile"(){
        when: "I go to the mine profile page for BLAH0000(the test mine)"
        to MineProfilePage

        then: "I should see profile of the Mine"
        // sleep(500)
        // println activeTab
        waitFor {activeTab == "Summary" }      
        assert mineNumber == "Mine ID: "+Const.MINE_NUMBER
        assert mineName == Const.MINE_NAME
        assert latValue.minus("Lat:").startsWith("48")
        assert longValue.minus("Long:").startsWith("-125")

    }

    def "Scenario: User should be able to add tenure number"(){
        given: "I go to mine profile"
        to MineProfilePage

        when: "User can update mine record with a new tenure number"
        def tempTenure = generateTenure()
        addTenure(tempTenure)

        and: "see successful message"
        toastMessage == "Successfully updated: ${Const.MINE_NAME}"


        then: "User can see the updated tenure number list"
        tenureUpdated(tempTenure) == true

    }

    def "Scenario: User should not be able to add tenure number if the given tenure is invalid"(){
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

    def "Scenario: User can create new mine manager and update mine manager information"(){
        given: "I go to mine profile"
        to MineProfilePage

        and: "At mine profile page"
        at MineProfilePage
        
        when: "I go to contact tab"
        contactInfoTab.click()
        sleep(100)

        and: "I create a new mine manager and update mine manager with the manager just created"
        modifyManager(FirstName,LastName,Date)
        sleep(200)

        then: "Should see successful message"
        assert toastMessage == "Successfully updated the manager of ${Const.MINE_NAME}"
        

        then: "I can see the manager information get updated"
        mineManagerCheck(FirstName,LastName,Date) == [true,true]

    }

    def cleanupSpec() {
        println "---------Cleaning--------------"
        DB_connection.MDS_FUNCTIONAL_TEST.execute(new File('src/test/groovy/Data/data_deletion.sql').text)
    }



}
