package modules

import geb.Module 

class Tab_Map extends Module {
    static at = {activeTab=='Map'}
    static content = {
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        tabSelect (wait:true) {$("div.ant-tabs-tab", text: "Permit")}

        permit_no (wait:true) {$("td", text: contains("BLAHPER-01"), 0)}
    }
    
}

 
        