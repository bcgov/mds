package modules

import geb.Module
import utils.Const

class Form_CreatePermit extends Module {
    static PERMITTEE = "Halfthor"
    static PERMITTEE_FULL_NAME = "Halfthor Zavicus, test@blah.do"
    static PERMIT_TYPE = "Mineral"
    static PERMIT_NUMBER = "66666"
    static PERMIT_STATUS = "Open"
    static ISSUE_DATE = '1983-12-08'
    static AMENDMENT_DATE =  "1984-12-08"
    static MINE_NAME = "MINETEST"
    static MODAL_HEADER = "Add a new permit to "+MINE_NAME

    static at = { waitFor() {header=="Add New Contact"}}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}

        // Permittee (wait:true) {}
        permittee (wait:true) {$("div", id:"permittee_party_guid").find('input')}
        permitteeName (wait:true) {$("li", text: PERMITTEE_FULL_NAME)}

        //Permit Type
        permitType (wait:true) {$("div", id:"permit_type")}
        mineralTypeOption (wait:true) {$("li", text: PERMIT_TYPE)}

        // Permit Number
        permitNumber (wait:true) {$("input", id:"permit_no")}

        // Permit status objects 
        permitStatus (wait:true) {$("div", id: "permit_status_code")}
        openStatusDropdownOption (wait:true) {$("li", text: PERMIT_STATUS)}

        // Date content objects
        issueDate (wait:true) {$("input", name:"issue_date")}
        calendarInput (wait:true) {$("input", class:"ant-calendar-input ")}

        //todo: uploadFiles

        submitButton  (wait:true) {$("button", type: "submit")}
        // submitButton  (wait:true) {$("button").has("span", text:MODAL_HEADER)}

        //Permit amendment forms
        descriptionField (wait:true) {$("textarea", id: "description")}
        
    }

    def completePermitForm(){
        waitFor() {header==MODAL_HEADER}
        // fill out permittee
        permittee = "Halfthor"
        permitteeName.click()

        // fill permit type
        permitType.click()
        mineralTypeOption.click()

        // fill out permit number
        permitNumber = PERMIT_NUMBER
        // select and fill out the permit status
        permitStatus.click()
        openStatusDropdownOption.click()

        // fill out issue date
        issueDate.click()
        calendarInput = ISSUE_DATE

        submitButton.click()

    }

    def completePermitAmendment(){
        // fill out permittee
        permittee = "Halfthor"
        permitteeName.click()

         // fill out issue date
        issueDate.click()
        calendarInput = AMENDMENT_DATE

        descriptionField = "A fancy description"
        submitButton.click()

    }
   
      
}