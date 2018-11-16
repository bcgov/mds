package modules

import geb.Module

class Form_UpdatePermittee extends Module {
    static at = { header=="Update Permittee" }
    static content = {
        // Context and state-tracking
        modal (wait: true) {$('.ant-modal-content')}
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message")}
        loadingBar (required:false) {$("div.ant-modal-body").find("div",0).find("div")}

        // inputs
        selectCurrentPermittee (wait:true) {$(id:"permittee", class: "ant-select ant-select-enabled")}
        currentPermitteeBox (wait:true) {selectCurrentPermittee.find("input", autocomplete: "off")}

        selectNewPermittee (wait:true) {$("div", id:"party")}
        newPermitteeBox (wait:true) {selectNewPermittee.find("input", class: "ant-select-search__field")}

        startDateBox (wait:true) {$("span", id:"startDate")}

        datePicker1 (wait:true) {$("input", placeholder:"yyyy-mm-dd")}
        datePicker2 (wait:true) {$("input.ant-calendar-input", 0)}

        // buttons
        saveButton (wait:true) {modal.find("button").has("span",text:"Update Permittee")}
    }

    def updatePermittee(permitteeData){
        // Fill out the Current Permittee Box
        waitFor { loadingBar.size()<=1 }
        selectCurrentPermittee.click()
        waitFor { selectCurrentPermittee.find("li", class: "ant-select-dropdown-menu-item", 0).click() }

        // Fill out the Start Date
        selectDate(permitteeData.date)

        // Fill out the New Permittee Box
        selectNewPermittee.click()
        newPermitteeBox=permitteeData.party_name
        waitFor { selectNewPermittee.find("li", class: "ant-select-dropdown-menu-item", 0).click() }

        // Submit
        saveButton.click()
    }

    def selectDate(date){
        datePicker1.click()
        datePicker2.click()
        datePicker2=date
    }
}
