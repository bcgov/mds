package pages

import geb.Page
import modules.*
import utils.Const

class MineProfilePage extends Page {
    static at = { waitFor() {activeTab == "Summary" }  }
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
        tenureTab (wait:true) {module Tab_Tenure}
        permitTab (wait:true) {module Tab_Permit}
        contactInfoTab (wait:true) {module Tab_Contact}
        tailingsTab (wait:true) {module Tab_Tailings}


        //Footer
        footer (wait:true) {$("div", class: "footer")}

        // //Permit Tab objects
        // newPermitButton (wait:true) {$("button", text: "Add a New Permit")}
        newPermitForm { module Form_CreatePermit }
        // //TODO: Remove magic string
        // permitRow (wait:true) {$("tr").has("div", title: "Permit No.",text: "M-66666")}
        // permitTitle (wait:true) {$("div", title: "Permit No.",text: "M-66666")}
        // addEditButton (wait:true) {$("button").has("div", text: "Add/Edit")}
        // editPermitStatusButton (wait:true) {$("button", text: "Edit permit status")}
        // addAmendmentButton (wait:true) {$("button", text: "Add permit amendment")}
        // editPermitFormStatusDropdown (wait:true) {$("div", id: "permit_status_code")}
        // closedDropdownOption (wait:true) {$("li", text: "Closed")}
        // submitEditPermitStatus (wait:true) {$("button", type: "submit")}
        // amendmentDescriptions (wait:true) {$("div", title: "Description")}
        // amendmentDescriptionSpecific (wait:true) {$("div", title: "Description").has(text:"A fancy description" )}
        // openFileModalButton (wait:true) {$("button").has("img", alt: "Edit")}
        // uploadField (wait:true) {$("input.filepond--browser")}
        // uploadCompleteMessage (wait:true) {$("span.filepond--file-status-main", text:"Upload complete")}
        // editPermitFileButton (wait:true) {$("button", text: "Edit initial permit for M-66666")}

        // downloadTestFileLink (wait:true) {$("a", text: Const.TEST_FILE_NAME)}
        

    }

}
