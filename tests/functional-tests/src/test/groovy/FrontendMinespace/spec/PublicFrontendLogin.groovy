package spec

import geb.spock.GebReportingSpec
import spock.lang.*

import FrontendMinespace.pages.MinespaceFrontendLoginPage
import FrontendMinespace.pages.KeycloakLoginPage
import FrontendMinespace.pages.HomePage

import utils.Const

@Title("Minespace-Frontend-LoginPage")
@Narrative("I can log into Minespace frontend using my IDIR")
@Stepwise
class  LoginPublicFrontEndPageSpec extends GebReportingSpec {
    def "I can log into the Minespace frontend given valid credentials"(){
        given:"I go to the homepage"
        to MinespaceFrontendLoginPage
        waitFor() { LoginButton.click() }

        when: "Page loaded"
        at KeycloakLoginPage

        and: "I input username and password"
        IDIRusername = Const.IDIR_USERNAME
        IDIRpassword = Const.IDIR_PASSWORD
        IDIRloginButton.click()

        then: "I am on the Dashboard page"
        at HomePage
    }
}

