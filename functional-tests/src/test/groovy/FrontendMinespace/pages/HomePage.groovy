package FrontendMinespace.pages

import geb.Page

class HomePage extends Page {
    static at = { title.startsWith("MineSpace") }
    static content = {
        LandingPageTitle (wait: true) {$("h1", class: "landing-page-title", text: "Welcome to MineSpace, an online portal for BC mines")} 
    }
}