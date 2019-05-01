package FrontendMinespace.pages

import geb.Page
import utils.Const

class HomePage extends Page {
    static at = {$("span", text: Const.MINESPACE_EMAIL )}
}