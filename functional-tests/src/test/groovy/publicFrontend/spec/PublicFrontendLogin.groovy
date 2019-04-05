package spec

import geb.spock.GebReportingSpec
import spock.lang.*

import publicFrontend.pages.PublicFrontendLoginPage
import publicFrontend.pages.KeycloakLoginPage
import publicFrontend.pages.HomePage

import utils.Const

@Title("Public-Frontend-LoginPage")
@Narrative("I can log into public frontend using my IDIR")
@Stepwise
class  LoginPublicFrontEndPageSpec extends GebReportingSpec {
    def "I can log into the public frontend given valid credentials"(){
        given:"I go to the homepage"
        to PublicFrontendLoginPage
        LoginButton.click()

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

