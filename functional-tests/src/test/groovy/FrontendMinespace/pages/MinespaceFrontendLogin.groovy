package FrontendMinespace.pages
import geb.Page
import utils.Const

class MinespaceFrontendLoginPage extends Page {
   
    static url = Const.MINESPACE_URL
    static content = {
        LoginButton (wait: true) {$("button", text: "Log in")}
    }
}

