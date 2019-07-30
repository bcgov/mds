package pages

import geb.Page
import modules.*
import utils.Const

class MineProfilePage extends Page {
    static at = { waitFor() {activeTab == "Summary" } }
    static url = "dashboard/${Const.MINE_GUID}/summary"
    static content = {
        //General
        mineName (wait:true) {$("h1",0).text()}
        mineNumber {$("p",1).text()}
        toastMessage (wait: true) {$("div.ant-notification-notice-message").text()}
        closeToastMessage (wait:true) {$("span.ant-notification-notice-close-x")}
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        createTSFDropdown (wait:true) {$("button.ant-dropdown-trigger", text:"Add/Edit")}
        createTSFDropdownButton (wait:true) {$("button", text:"+ Add TSF")}


        //TabPanel
        permitTab (wait:true) {module Tab_Permit}
        contactInfoTab (wait:true) {module Tab_Contact}
        tailingsTab (wait:true) {module Tab_Tailings}


        //Footer
        footer (wait:true) {$("div", class: "footer")}

        //Permit Tab objects
        newPermitForm { module Form_Create_And_Edit_Permit }
        downloadTestFileLink (wait:true) {$("a", text: Const.TEST_FILE_NAME)}

    }

}
