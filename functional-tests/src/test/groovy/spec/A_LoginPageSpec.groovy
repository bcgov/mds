package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*



@Title("MDS-LoginPage")
@Narrative("I can log into MDS using my IDIR")
@Stepwise
class  A_LoginPageSpec extends GebReportingSpec {
    def "I can log into the app given valid credentials"(){
        given:"I go to the homepage"
        to LoginPage
        sleep(2000)

        when: "Page loaded"
        at LoginPage

        and: "I input username and password"
        IDIRusername = "vzhang"
        IDIRpassword = "Only4Support"
        IDIRloginButton.click()

        then: "I am on the Dashboard page"
        at DashboardPage
    }
}