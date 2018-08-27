package pages

import geb.Page

class LoginPage extends Page {
    static at = { title == "Government of British Columbia"}
    static content = {
        IDIRusername (wait: true) {$("input", id: "user")}
        IDIRpassword (wait: true) {$("input", id: "password")}
        IDIRloginButton (wait: true) {$("input", value: "Continue")}
    }
}