package spec

import geb.spock.GebReportingSpec
import io.github.cdimascio.dotenv.Dotenv
import spock.lang.*


import pages.LoginPage
import pages.DashboardPage
import utils.Const



@Title("MDS-LoginPage")
@Narrative("I can log into MDS using my IDIR")
@Stepwise
class  A_LoginPage extends GebReportingSpec {
    Dotenv dotenv = Dotenv.configure().directory("./").load()
    def "I can log into the app given valid credentials"(){
        given:"I go to the homepage"
        to LoginPage

        when: "Page loaded"
        at LoginPage

        and: "I input username and password"
        IDIRusername = dotenv.get("IDIR_USERNAME")
        IDIRpassword = dotenv.get("IDIR_PASSWORD")
        IDIRloginButton.click()

        then: "I am on the Dashboard page"
        at DashboardPage
    }
}