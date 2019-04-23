package modules

import geb.Module

class Form_CreateContactAddRole extends Module {
    static at = { waitFor() {header=="Add New Contact"}}
    static content = {
        addRoleButton (wait:true) {$("button").has("span", text:"Add Role")}
    }

    def createContactFormAddRole(){
        addRoleButton.click()
    }
}
