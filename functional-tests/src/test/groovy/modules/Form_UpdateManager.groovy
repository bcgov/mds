package modules

import geb.Module

class Form_UpdateManager extends Module { 
    static at = { header=="Update Mine Manager"}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        errorMessage (wait: true) {$("div", class:"ant-form-explain").text()}
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
        closeToastMessage (wait:true) {$("i.ant-notification-close-icon").find("svg")}
        managerList (required:false) {$("li.ant-select-dropdown-menu-item", 0)}
        loadingBar (required:false) {$("div.ant-modal-body").find("div",0).find("div")}
        //input
        managerFirstNameBox (wait:true) {$("input", id:"first_name")}
        managerSurNameBox (wait:true) {$("input", id:"party_name")}
        managerEmailBox (wait:true) {$("input",id:"email")}
        managerPhoneBox (wait:true) {$("input", id:"phone_no")}
        managerExtBox (wait:true) {$("input",id:"phone_ext")}
        partyBox (wait:true) {$("li").find("div").find("input", type: "text")}
        datePicker1 (wait:true) {$("input", placeholder:"yyyy-mm-dd")}
        datePicker2 (wait:true) {$("input.ant-calendar-input", placeholder:"yyyy-mm-dd")}
        selectParty (wait:true) {$("div", class:"ant-select-selection ant-select-selection--single")}
         
        //button
        createPersonnelButton (wait:true) {$("button").has("span",text:"Create Personnel")}
        updateMineManagerButton (wait:true) {$("form").find("div").find("button").has("span",text:"Update Mine Manager")} 
        cancelButton (wait:true) {$("button.ant-modal-close")}      
         
        
    }


    def createPersonnel(managerProfileData){
        managerFirstNameBox = managerProfileData.first_name
        managerSurNameBox = managerProfileData.surname
        managerPhoneBox = managerProfileData.phone
        managerExtBox = managerProfileData.ext
        managerEmailBox = managerProfileData.email
        createPersonnelButton.click()
        closeToastMessage.click()
    }

    def updateMineManager(managerProfileData){
        def staleElement = true
        def loading = true
        selectDate(managerProfileData.date)
        selectParty.click()
        partyBox = "${managerProfileData.first_name} ${managerProfileData.surname}" 
        while (loading && loadingBar.size()>1){
            if (loadingBar.size()==1 ){
                loading=false
            }
        }   
        while (staleElement){
            try {
                managerList.click() 
                staleElement = false
            } catch (org.openqa.selenium.StaleElementReferenceException e){
                staleElement = true
            }
        } 
        updateMineManagerButton.click()
    }

    def selectDate(date){
        datePicker1.click()
        datePicker2.click()
        datePicker2=date
    }


    
 
} 