package publicFrontend.pages

import geb.Page

class PublicFrontendLoginPage extends Page {
    static url = "http://localhost:3020"
    static content = {
        LoginButton (wait: true) {$("button", text: "Log in")}
    }
}

