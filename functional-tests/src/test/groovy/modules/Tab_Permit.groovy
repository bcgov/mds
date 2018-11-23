package modules

import geb.Module 

class Tab_Permit extends Module {
    static at = {activeTab=='Permit'}
    static content = {
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        tabSelect (wait:true) {$("div.ant-tabs-tab", text: "Permit")}

        permit_no (wait:true) {$("div.ant-row-flex").find(id: "permit_no",0)}
        permit_date (wait:true) {$("div.ant-row-flex").find(id: "permit_issue_date",0)}   
    }
    
}

 
        