package pages

import geb.Page
import modules.*
import utils.*

class MineProfilePage extends Page {
    static at = { waitFor() {mineName == Const.MINE_NAME } }
    
    static url = "mine-dashboard/${Const.MINE_GUID}/mine-information/general"
    static content = {
        //General
        mineName (wait:true) {$("h1",0).text()}
        mineNumber {$("div",id:"mine-no").text()}
        toastMessage (wait: true) {$("div.ant-notification-notice-message").text()}
        closeToastMessage (wait:true) {$("span.ant-notification-notice-close-x")}
        activeTab (wait:true) {$("li",id:"active-menu-btn").text()}
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
