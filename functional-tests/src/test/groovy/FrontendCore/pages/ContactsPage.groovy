package pages

import geb.Page
import modules.*

class ContactsPage extends Page {
    static at = { waitFor() {!loadingScreen.displayed}}
    static url = "dashboard/contacts"
    static content = {
        //general
        loadingScreen (required:false) {$("div.loading-screen")}

        // //create contact form
        // createMineForm { module Form_CreateMine }
        // createMineButton_Dashboard (wait: true) {$("button").has("span", text:"Create Mine Record")}

        // //Dashboard
        // viewLink (wait:true) {$("a", text: contains("MINETEST"))}
        // firstMineName (wait:true) {$("a", text: contains("MINETEST")).text()}
        createContactForm { module Form_CreateContact_1 }
        createContactButton (wait: true) {$("button").has("span", text:"Add New Contact")}
        //search first name
        searchBoxFirstName (wait:true){$("input", id:"first_name")}
        searchBoxLastName (wait:true){$("input", id:"last_name")}

        // // resultList (required:false, wait: false) {$("ul", role: "listbox").find("li")}

        // //pagination
        // totalMineNum (wait:true) {$("li.ant-pagination-total-text").text()}
        // paginationSelection (wait:true) {$("div.ant-select-selection-selected-value")}

    }

}