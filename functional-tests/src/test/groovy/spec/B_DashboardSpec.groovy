package spec

import geb.spock.GebReportingSpec
import spock.lang.*

import pages.*

@Title("MDS-DashboardPage")
@Stepwise
class  B_DashboardSpec extends GebReportingSpec {
    static NAME_GOOD = "Trend-Roman"


    // def "Scenario: User is able to create a mine record given a valid MIND-Name"(){
    //     given: "I go to the DashboardPage"
    //     to DashboardPage

    //     when: "I click the create a mine button"
    //     createMineButton.click()

    //     then: "I go to the mine record form page"
    //     createMineForm.header == "Create A Mine Record"

    //     when: "I input valid mine name"
    //     createMineForm.createMineRecord(NAME_GOOD)

    //     then: "I should see the successful message"
    //     //toastMessage == "Successfully created: " + NAME_GOOD
    //     println "created"
    // }


    // def "Scenario: Error displayed when the given mine name is in wrong format"(){
    //     given: "I go to the DashboardPage"
    //     to DashboardPage

    //     when: "I click the create a mine button"
    //     createMineButton.click()

    //     then: "I go to the mine record form page"
    //     createMineForm.header == "Create A Mine Record"

    //     when: "I input invalid mine name"
    //     createMineForm.createMineRecord(badName)
    //     println scenario

    //     then: "I should see a warning"
    //     createMineForm.errorMessage == errorMessage

    //     where: 
    //     scenario    |badName    ||errorMessage
    //     "long name" |"r2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQR" || "Must be 60 characters or less"
    //     "short name"|"ab"       ||"Must be 3 characters or more"
    //     "null"      |""         ||"This is a required field"

    // }
    // def "Scenario: User can view the created record on Dashboard"(){
    //     when: "I go to the DashboardPage"
    //     to DashboardPage

    //     then: "I should see the created record on the Dashboard"
    //     sleep(500)
    //     assert dashboardValidation(NAME_GOOD) == true
    // }

    // def "Scenario: User can search for a specific mine "(){
    //     given: "I am on the Dashboard Page"
    //     to DashboardPage

    //     when: "I search for a mine using mine name"
    //     searchBox = keyword
    //     println scenario


    //     then: "I should see a list of mine record whose names contain the keyword"
    //     assert searchResultValidation(keyword) == true
         
    //     where:
    //     scenario                | keyword
    //     "regular search"        |"Trend"
    //     "not case sensitive"    |"LKK"
    //     "search by ID"          |"blah6"   
    //     "not found"             |"sdkfj"
    // }

    def "Scenario: Redirect to Mine Summary page once search result is selected"(){
        given: "I am on the Dashboard Page"
        to DashboardPage

        when: "I search for a mine using mine name"
        searchBox = "trend"

        and: "I select a mine from the result list"
        searchResultSelection()
        
        
        then: "I am redirected to the mine summary page"
        println "hah"

    }
    
}
