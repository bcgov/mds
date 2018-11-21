package modules

import geb.Module

class Form_UpdatePermittee extends Module {
    static at = { header=="Update Permittee" }
    static content = {
        // Context and state-tracking
        modal (wait: true) {$('.ant-modal-content')}
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message")}
        loadingBar (required:false) {$("div.ant-modal-body").find("div",0).find("div")}

        // update permittee inputs
        selectCurrentPermittee (wait:true) {$(id:"permittee", class: "ant-select ant-select-enabled")}
        currentPermitteeBox (wait:true) {selectCurrentPermittee.find("input", autocomplete: "off")}
        selectCurrentPermitteeFirstItem (wait:true) {selectCurrentPermittee.find("li", class: "ant-select-dropdown-menu-item", 0)}

        selectNewPermittee (wait:true) {$("div", id:"party")}
        newPermitteeBox (wait:true) {selectNewPermittee.find("input", class: "ant-select-search__field")}
        selectNewPermitteeFirstItem (wait:true) {selectNewPermittee.find("li", class: "ant-select-dropdown-menu-item", 0)}

        startDateBox (wait:true) {$("span", id:"startDate")}

        datePicker1 (wait:true) {$("input", placeholder:"yyyy-mm-dd")}
        datePicker2 (wait:true) {$("input.ant-calendar-input", 0)}

        // new party inputs
        permitteeFirstNameBox (wait:true) {$("input", id:"first_name")}
        permitteeSurNameBox (wait:true) {$("input", id:"party_name")}
        permitteeEmailBox (wait:true) {$("input",id:"email")}
        permitteePhoneBox (wait:true) {$("input", id:"phone_no")}
        permitteeExtBox (wait:true) {$("input",id:"phone_ext")}

        // buttons
        saveButton (wait:true) {modal.find("button").has("span",text:"Update Permittee")}
        createPersonnelButton (wait:true) {$("button").has("span",text:"Create Personnel")}
    }

    def updatePermittee(permitteeProfileData){
        def fullName = "${permitteeProfileData.first_name} ${permitteeProfileData.surname}"

        // Fill out the Current Permittee Box
        waitFor { loadingBar.size()<=1 }
        selectCurrentPermittee.click()
        waitFor { selectCurrentPermitteeFirstItem.click() }

        // Fill out the Start Date
        selectDate(permitteeProfileData.date)

        // Fill out the New Permittee Box
        selectNewPermittee.click()
        newPermitteeBox=fullName
        waitFor { selectNewPermitteeFirstItem.text()==fullName }
        waitFor { selectNewPermitteeFirstItem.click() }

        // Submit
        saveButton.click()
    }

    def createParty(permitteeProfileData){
        permitteeFirstNameBox = permitteeProfileData.first_name
        permitteeSurNameBox = permitteeProfileData.surname
        permitteePhoneBox = permitteeProfileData.phone
        permitteeExtBox = permitteeProfileData.ext
        permitteeEmailBox = permitteeProfileData.email
        createPersonnelButton.click()
    }

    def selectDate(date){
        datePicker1.click()
        datePicker2.click()
        datePicker2=date
    }
}
