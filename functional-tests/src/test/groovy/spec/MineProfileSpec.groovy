package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*

 
@Title("MDS-MineProfilePage")
@Narrative("At mine profile page, I can add tenure number")
@Stepwise
class  MineProfilePageTest extends GebReportingSpec {
    //variables
    //static tempTenure = ""
    def selectedMine = ["",""]
    def selectedMine_NO 
    def selectedMine_NAME
    static TENURE_SHORT = "123456"      
    static TENURE_LONG =  "123456677998"   
    static TENURE_BAD =  "1234cha"  
    static EXPECTED_ERROR = "Specified number must be exactly 7 digits long."
         
 


    def "Scenario: User can view the mine profile and add tenure ID"(){
        when: "I go to the homepage"
        to HomePage

        and: "I select a mind to view"
        selectedMine = selectRandomMine()
        selectedMine_NO = selectedMine[0]
        selectedMine_NAME = selectedMine[1]

        
        then: "I am on the mine profile page"
        at MineProfile

        and: "I should see profile of selected Mine"
        sleep(200)
        assert currentUrl.endsWith("dashboard/${selectedMine_NO}/summary")
        assert activeTab == "Mine Summary"       
        assert mineProfile_NO== "Mine #: " +selectedMine_NO
        assert mineName.startsWith(selectedMine_NAME)

        when: "User can update mine record with a new tenure number"
        def tempTenure = generateTenure()
        addTenure(tempTenure)

        then: "see successful message"
        toastMessage == "Successfully updated: ${selectedMine_NO}"


        and: "Refresh the page, user can see the updated tenure number list"
        driver.navigate().refresh()
        tenureUpdated(tempTenure) == true

        when: "Tenure number is not a 7 digit number, short"
        addTenure(TENURE_SHORT)

        then:"User see ERROR message"
        toastMessage == EXPECTED_ERROR

        and: "Refresh the page, tenure number list stays the same"
        driver.navigate().refresh()
        tenureUpdated(TENURE_SHORT) == false

        when: "Tenure number is not a 7 digit number, long"
        addTenure(TENURE_LONG)

        then:"User see ERROR message"
        toastMessage == EXPECTED_ERROR

        and: "Refresh the page, tenure number list stays the same"
        driver.navigate().refresh()
        tenureUpdated(TENURE_LONG) == false

        when: "Tenure number is not a 7 digit number, long"
        addTenure(TENURE_BAD)

        then:"User see ERROR message"
        toastMessage == "Error!"

        and: "Refresh the page, tenure number list stays the same"
        driver.navigate().refresh()
        tenureUpdated(TENURE_BAD) == false
 
    }

 
}
