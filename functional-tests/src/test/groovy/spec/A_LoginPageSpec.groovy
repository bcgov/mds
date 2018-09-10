package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.Const



@Title("MDS-LoginPage")
@Narrative("I can log into MDS using my IDIR")
@Stepwise
class  A_LoginPageSpec extends GebReportingSpec {
    def "I can log into the app given valid credentials"(){
        given:"I go to the homepage"
        to LoginPage

        when: "Page loaded"
        at LoginPage

        and: "I input username and password"
        println LoginPage.getClass()
        IDIRusername = Const.IDIR_USERNAME
        IDIRpassword = Const.IDIR_PASSWORD
        IDIRloginButton.click()

        then: "I am on the Dashboard page"
        println DashboardPage.getClass()
        at DashboardPage
        println title
    }
}