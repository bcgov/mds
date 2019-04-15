package FrontendMinespace.pages

import geb.Page
import utils.Const

class HomePage extends Page {
    String userTitleText = "Welcome, "+Const.IDIR_USERNAME.toLowerCase()+"."
    static at = { $("h1", class: "user-title", text: userTitleText )}
}