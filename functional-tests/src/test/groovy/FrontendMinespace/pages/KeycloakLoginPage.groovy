package FrontendMinespace.pages

import geb.Page

class KeycloakLoginPage extends Page {
    static at = { title.startsWith("Log in to mds") }
    static content = {
        IDIRusername (wait: true) {$("input", id: "username")}
        IDIRpassword (wait: true) {$("input", id: "password")}
        IDIRloginButton (wait: true) {$("input", value: "Log In")}
    }
}