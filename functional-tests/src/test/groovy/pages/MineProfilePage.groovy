package pages

import geb.Page
import modules.*
import utils.Const

class MineProfilePage extends Page {
    static at = { waitFor(10,2) {activeTab == "Summary" }  } 
    static url = "dashboard/${Const.MINE_GUID}/summary/"
    static content = {
        //General
        mineName (wait:true) {$("h1",0).text()}
        mineNumber {$("h5",0).text().minus("Mine #: ")} 
        latValue (wait:true) {$("div")find("p",0).text()} 
        longValue (wait:true) {$("div")find("p",1).text()} 
        toastMessage (wait: true) {$("div.ant-notification-notice-message").text()}
        closeToastMessage (wait:true) {$("span.ant-notification-notice-close-x")} 
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}

        //TabPanel  
        tenureTab (wait:true) {module Tab_Tenure}
        permitTab (wait:true) {module Tab_Permit}
        contactInfoTab (wait:true) {module Tab_Contact}
       
    }

 
}
 