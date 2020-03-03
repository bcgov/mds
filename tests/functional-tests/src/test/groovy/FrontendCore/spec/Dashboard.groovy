package spec

import geb.spock.GebReportingSpec
import spock.lang.*

import pages.Dashboard
import pages.MineProfilePage
import utils.*
import dataObjects.MineProfileData


@Title("MDS-Dashboard Page")
@Stepwise
class  DashboardSpec extends GebReportingSpec {
    static NAME_GOOD = "!!!Mine-Test ABC"
    static NAME_GOOD_TWO = "!!!Mine-Test DEF"
    static STATUS    = "Closed / Orphaned / Long-Term Maintenance"
    static LAGTITUTE = "52.6565"
    static LONGTITUE = "124.2342"
    static NOTES     = "This is a test mine"
    static NULL      = ""
    static BAD_NAME_1= "r2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQr2WP67KnSJulLVayXkRQR"
    static BAD_NAME_2= "ab"



    def "Scenario: User is able to create a mine record "(){
        given: "I go to the Dashboard Page"
        to Dashboard

        when: "page is loaded"
        at Dashboard

        and: "I click the create a mine button"
        waitFor() { createMineButton_Dashboard.click() }

        and: "I type in valid mine profile"
        createMineForm.createMineRecord(input)
        waitFor {toastMessage!= null }

        then: "I should see the successful message"
        toastMessage == "Successfully created: " + NAME_GOOD

        where:
        scenario                            | input
        "Giving only mine name and status"  |new MineProfileData (NAME_GOOD,STATUS,NULL,NULL,NULL)
    }

    def "Scenario: User is able to create a mine record with fullmine info "(){
        given: "I go to the Dashboard Page"
        to Dashboard

        when: "page is loaded"
        at Dashboard

        and: "I click the create a mine button"
        waitFor() { createMineButton_Dashboard.click() }

        and: "I type in valid mine profile"
        createMineForm.createMineRecord(input)
        waitFor {toastMessage!= null }

        then: "I should see the successful message"
        toastMessage == "Successfully created: " + NAME_GOOD_TWO

        where:
        scenario                            | input
        "Giving full mine information"      |new MineProfileData (NAME_GOOD_TWO,STATUS,LAGTITUTE,LONGTITUE,NOTES)
    }

    def "Scenario: User can view a mine"(){
        def SearchedDashboard = new Dashboard(url: "dashboard/mines?page=1&per_page=25&search="+Const.MINE_NAME)

        given: "I am on the Dashboard Page after searching '!!MINE'"
        to SearchedDashboard
        def viewMineName = SearchedDashboard.firstMineName
        def link = SearchedDashboard.viewLink

        when: "page is loaded"
        at SearchedDashboard

        and: "I click to view the first mine"
        waitFor() { link.click() }

        then:"I can view the page"
        at MineProfilePage
        assert mineName == viewMineName
    }

    // def "Scenario: User can search for a specific mine "(){
    //     given: "I am on the Dashboard Page"
    //     to Dashboard

    //     when: "I search for a mine using mine name"
    //     search(keyword)
    //     println "Scenario: "+ scenario


    //     then: "I should see a list of mine record whose names contain the keyword"
    //     assert searchResultValidation(keyword) == result

    //     where:
    //     scenario                |keyword    |result
    //     "Regular search"        |"Mine"     |true
    //     "Not case sensitive"    |"TEST"     |true
    //     "Search by ID"          |"blah0000" |true
    //     "Not found"             |"sdkfj"    |false
    // }



    //TO-Do: Update test for search when the bug fix for search get merged
    // def "Scenario: Redirect to Mine Summary page once search result is selected"(){
    //     given: "I am on the Dashboard Page"
    //     to Dashboard

    //     when: "I search for a mine using mine name"
    //     searchBox = "test"

    //     and: "I select a mine from the result list"
    //     def viewMineID = searchResultSelection()

    //     then: "I am redirected to the mine summary page"
    //     at MineProfilePage
    //     assert mineNumber == "Mine ID: "+viewMineID

    // }

}
