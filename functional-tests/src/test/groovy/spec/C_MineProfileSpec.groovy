package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*

 
@Title("MDS-MineProfilePage")
@Stepwise
class  C_MineProfileSpec extends GebReportingSpec {
    @Shared selectedMine = ["",""]
    @Shared selectedMine_NO 
    @Shared selectedMine_NAME
    @Shared urlTemp =""

    static TENURE_SHORT = "123456"      
    static TENURE_LONG =  "123456677998"   
    static TENURE_BAD =  "1234cha"  


    static FirstName = "Vivián"
    static LastName = "Zándeús"
    static Date = "2017-08-04"


    def "Scenario: User can view the mine profile"(){
        when: "I go to the dashboard page"
        to DashboardPage

        and: "I select a mind to view"
        selectedMine = selectRandomMine()
        selectedMine_NO = selectedMine[0]
        selectedMine_NAME = selectedMine[1]

        
        then: "I am on the mine profile page"
        at MineProfilePage
       
        when:
        urlTemp = currentUrl

        then: "I should see profile of selected Mine"
        sleep(100)
        assert activeTab == "Mine Summary"       
        assert mineProfile_NO== "Mine #: " +selectedMine_NO
        assert mineName.startsWith(selectedMine_NAME)

    }

    def "Scenario: User should be able to add tenure number"(){
        given: "I go to mine profile"
        go urlTemp

        when: "User can update mine record with a new tenure number"
        def tempTenure = generateTenure()
        addTenure(tempTenure)

        and: "see successful message"
        toastMessage == "Successfully updated: ${selectedMine_NAME}"


        then: "Refresh the page, user can see the updated tenure number list"
        driver.navigate().refresh()
        tenureUpdated(tempTenure) == true

    }

    def "Scenario: User should not be able to add tenure number if the length is invalid"(){
        given: "I go to mine profile"
        go urlTemp

        when: "Tenure number is not all numerical but not meet length requirement"
        addTenure(bad_tenure)
        println scenario

        and:"User see warning message"
        warningMessage == warning

        then: "Refresh the page, tenure number list stays the same"
        driver.navigate().refresh()
        tenureUpdated(bad_tenure) == false

        where:
        scenario        |bad_tenure    |warning
        "short tenure"  |"123456"      |"Must be 7 characters long"
        "long tenure"   |"123456677998"|"Must be 7 characters long"
    }


    def "Scenario: User should not be able to add tenure number if it contains nonnumerical value"(){
        given: "I go to mine profile"
        go urlTemp
         
        
        when: "Tenure number contains nonnumerical value"
        addTenure(TENURE_BAD)

        and:"User see ERROR message"
        toastMessage == "Error!"

        then: "Refresh the page, tenure number list stays the same"
        driver.navigate().refresh()
        tenureUpdated(TENURE_BAD) == false
 
    }

    def "Scenario: User can create new mine manager and update mine manager information"(){
        
        given: "I go to mine profile"
        go urlTemp

        and: "At mine profile page"
        at MineProfilePage
        
        when: "I go to contact tab"
        contactInfoTab.click()
        sleep(100)

        and: "I create a new mine manager"
        createMineManager(FirstName,LastName)

        and: "I can update mine manager with the manager just created"
        updateMineManager(FirstName,LastName,Date)

        then: "Should see successful message"
        assert toastMessage == "Successfully updated the manager of ${selectedMine_NAME}"

        then: "I can see the manager information get updated"
        mineManagerCheck(FirstName,LastName,Date) == [true,true]



    }



}
