package modules

import geb.Module
import modules.Form_UpdateManager

class Tab_Contact extends Module {
    static at = {waitFor() {activeTab=='Contact Information'}}
    static content = {
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        tabSelect (wait:true) {$("div.ant-tabs-tab", text: "Contact Information")}
    }
}
