package modules

import geb.Module 

class Tab_Permit extends Module {
    static at = {activeTab=='Permit'}
    static content = {
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        tabSelect (wait:true) {$("div.ant-tabs-tab", text: "Permit")}

        permit_no (wait:true) {$("td", text: contains("BLAHPER-01"), 0)}

        //Permit Tab objects
        newPermitButton (wait:true) {$("button", text: "Add a New Permit")}
        newPermitForm { module Form_CreatePermit }
        //TODO: Remove magic string
        permitRow (wait:true) {$("tr").has("div", title: "Permit No.",text: "M-66666")}
        permitTitle (wait:true) {$("div", title: "Permit No.",text: "M-66666")}
        addEditButton (wait:true) {$("button").has("div", text: "Add/Edit")}
        editPermitStatusButton (wait:true) {$("button", text: "Edit permit status")}
        addAmendmentButton (wait:true) {$("button", text: "Add permit amendment")}
        editPermitFormStatusDropdown (wait:true) {$("div", id: "permit_status_code")}
        closedDropdownOption (wait:true) {$("li", text: "Closed")}
        submitEditPermitStatus (wait:true) {$("button", type: "submit")}
        amendmentDescriptions (wait:true) {$("div", title: "Description")}
        amendmentDescriptionSpecific (wait:true) {$("div", title: "Description").has(text:"A fancy description" )}
        openFileModalButton (wait:true) {$("button").has("img", alt: "Edit")}
        uploadField (wait:true) {$("input.filepond--browser")}
        uploadCompleteMessage (wait:true) {$("span.filepond--file-status-main", text:"Upload complete")}
        editPermitFileButton (wait:true) {$("button", text: "Edit initial permit for M-66666")}

        downloadTestFileLink (wait:true) {$("a", text: Const.TEST_FILE_NAME)}
    }
    
}

 
        