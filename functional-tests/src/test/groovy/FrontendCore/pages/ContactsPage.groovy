package pages

import geb.Page
import modules.*

class ContactsPage extends Page {
    static at = { waitFor() {!loadingScreen.displayed}}
    static url = "dashboard/contacts"
    static content = {
        //general
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message")}
        loadingScreen (required:false) {$("div.loading-screen")}

        //Form to be completed to create a contact
        createContactForm { module Form_CreateContact }

        createContactButton (wait: true) {$("button").has("span", text:"Add New Contact")}
        //search first name
        searchBoxFirstName  (wait:true){$("input", id:"first_name")}
        searchBoxLastName   (wait:true){$("input", id:"last_name")}
        applyFilterButton   (wait:true){$("button", type:"submit")}
        contactTableContent (wait:true){$("tr", class:"ant-table-row ant-table-row-level-0")}

    }

}