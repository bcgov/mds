package spec
import geb.Page
import geb.spock.GebReportingSpec
import spock.lang.*

// import publicFrontend.pages.PublicFrontendLoginPage.PublicFrontendLoginPage
// import public-frontend.pages.Dashboard
import utils.Const




class PublicFrontendLoginPage extends Page {
    static url = "http://localhost:3020"
    //static at = { title.startsWith("Log in to") }
    static content = {
        LoginButton (wait: true) {$("button", text: "Log in")}
    }
}

class KeycloakLoginPage extends Page {
    static at = { title.startsWith("Log in to mds") }
    static content = {
        IDIRusername (wait: true) {$("input", id: "username")}
        IDIRpassword (wait: true) {$("input", id: "password")}
        IDIRloginButton (wait: true) {$("input", value: "Log in")}
    }
}

class HomePage extends Page {
    static at = { title.startsWith("MineSpace") }
    static content = {
        LandingPageTitle (wait: true) {$("h1", class: "landing-page-title", text: "Welcome to MineSpace, an online portal for BC mines")} 
    }
}



@Title("Public-Frontend-LoginPage")
@Narrative("I can log into public frontend using my IDIR")
@Stepwise
class  LoginPublicFrontEndPageSpec extends GebReportingSpec {
    def "I can log into the public frontend given valid credentials"(){
        given:"I go to the homepage"
        to PublicFrontendLoginPage
        print("I GOT HERE!!!")
        print(LoginButton)
        LoginButton.click()
       

        when: "Page loaded"
        to KeycloakLoginPage
        // at PublicFrontendLoginPage

        and: "I input username and password"
        // LoginButton.click()
        IDIRusername = Const.IDIR_USERNAME
        IDIRpassword = Const.IDIR_PASSWORD
        IDIRloginButton.click()

        then: "I am on the Dashboard page"
        at HomePage
    }
}

