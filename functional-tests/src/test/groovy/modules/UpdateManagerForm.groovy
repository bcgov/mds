package modules

import geb.Module

class UpdateManagerForm extends Module {
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        errorMessage (wait: true) {$("div", class:"ant-form-explain").text()}
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
        closeToastMessage (wait:true) {$("span.ant-notification-notice-close-x")}

        //input
        managerFirstNameBox (wait:true) {$("input", id:"first_name")}
        managerSurNameBox (wait:true) {$("input", id:"surname")}
        managerSelectNameBox (wait:true) {$("input", id:"mineManager")}
        datePicker1 (wait:true) {$("input", class:"ant-calendar-picker-input ant-input")}
        datePicker2 (wait:true) {$("input.ant-calendar-input", placeholder:"Select date")}
        selectToInputManager (wait:true) {$("div", class:"ant-select-selection ant-select-selection--single")}
         
        //button
        createMineManagerButton (wait:true) {$("button").has("span",text:"Create Party")}
        updateMineManagerButton (wait:true) {$("button").has("span",text:"Update Mine Manager")} 
        cancelButton (wait:true) {$("button.ant-modal-close")}     
        updateButton (wait:true) {$("button").has("span",text:"Update")}
         
        
    }


    def createMineManager(firstName,lastName){
        managerFirstNameBox = firstName
        managerSurNameBox = lastName
        createMineManagerButton.click()
        closeToastMessage.click()
    }

    def selectDate(date){
        datePicker1.click()
        datePicker2.click()
        datePicker2=date
    }

    def updateMineManager(firstName,lastName,date){
        selectDate(date)
        selectToInputManager.click()
        managerSelectNameBox = "${firstName} ${lastName}"
        updateMineManagerButton.click()
        updateMineManagerButton.click()
    }

    
 
} 