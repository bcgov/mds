package pages

import geb.Page

class LoginPage extends Page {
    static at = { title == "Log in to mds"}
    static content = {
        IDIRusername (wait: true) {$("input", id: "username")}
        IDIRpassword (wait: true) {$("input", id: "password")}
        IDIRloginButton (wait: true) {$("input", value: "Log in")}
    }
}