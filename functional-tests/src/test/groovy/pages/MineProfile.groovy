package pages

import geb.Page
import modules.*
import utils.Const

class MineProfilePage extends Page {
    static at = { waitFor() {activeTab == "Summary" }  }
    static url = "dashboard/${Const.MINE_GUID}/summary/"
    static content = {
        //General
        mineName (wait:true) {$("h1",0).text()}
        mineNumber {$("h5",0).text().minus("Mine #: ")}
        toastMessage (wait: true) {$("div.ant-notification-notice-message").text()}
        closeToastMessage (wait:true) {$("span.ant-notification-notice-close-x")}
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        createTSFDropdown (wait:true) {$("button.ant-dropdown-trigger")}
        createTSFDropdownButton (wait:true) {$("button", text:"Add a TSF")}


        //TabPanel
        tenureTab (wait:true) {module Tab_Tenure}
        permitTab (wait:true) {module Tab_Permit}
        contactInfoTab (wait:true) {module Tab_Contact}
        tailingsTab (wait:true) {module Tab_Tailings}

    }

}
