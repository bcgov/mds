package modules

import geb.Module

class Tab_Contact extends Module {
    static at = {waitFor() {activeTab=='Contact Information'}}
    static content = {
        addButton (wait:true) {$("button", text:"Add New Contact")}
        addManagerButton (wait:true) {$("button").has("span",text:"Mine Manager")}
        header (wait:true) {$("div", id:"rcDialogTitle0").text()}
    }

     def modifyManager(){
         addButton.click();
         addManagerButton.click();
    }


}
