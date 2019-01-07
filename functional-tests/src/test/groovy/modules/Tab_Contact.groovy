package modules

import geb.Module

class Tab_Contact extends Module {
    static at = {waitFor() {activeTab=='Contact Information'}}
    static content = {
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        tabSelect (wait:true) {$("div.ant-tabs-tab", text: "Contact Information")}
    }
}
