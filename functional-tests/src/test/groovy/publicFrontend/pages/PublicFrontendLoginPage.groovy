package pages

import geb.Page

class PublicFrontendLoginPage extends Page {
    static url = "http://localhost:3020"
    static content = {
        LoginButton (wait: true) {$("span", text: "Log in")}
    }
    //static at = { title.startsWith("Log in to") }
    // static content = {
    //     IDIRusername (wait: true) {$("input", id: "username")}
    //     IDIRpassword (wait: true) {$("input", id: "password")}
    //     IDIRloginButton (wait: true) {$("input", value: "Log in")}
    // }
}


