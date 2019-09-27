package pages

import geb.Page
import modules.*
import utils.Const

class ContactsPage extends Page {
    static at = { waitFor() {!loadingScreen.displayed}}
    static url = "dashboard/contacts"
    static content = {
        //general
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message")}
        successfulToastMessage (wait: true) {$("div", class:"ant-notification-notice-content").has("svg", "data-icon":"check-circle")}
        loadingScreen (required:false) {$("div.loading-screen")}

        //Form to be completed to create a contact
        createContactForm { module Form_CreateContact }

        createContactButton (wait: true) {$("button").has("span", text:"Add New Contact")}
        //search first name
        searchBoxFirstName  (wait:true){$("input", id:"first_name")}
        searchBoxLastName   (wait:true){$("input", id:"last_name")}
        applyFilterButton   (wait:true){$("button", type:"submit")}
        
        //Table content
        tableBody (wait:true){$("tbody", class:"ant-table-tbody")}
        contactTableContent (wait:true){$("tr", class:"ant-table-row fade-in ant-table-row-level-0")}
        contactTableNameOne (wait:true){$("tr", class:"ant-table-row ant-table-row-level-0").has("a", text: Const.CONTACT_FULL_NAME)}

    }


}