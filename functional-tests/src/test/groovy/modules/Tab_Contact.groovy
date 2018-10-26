package modules

import geb.Module
import modules.Form_UpdateManager 

class Tab_Contact extends Module {
    static at = {waitFor(5,0.5) {activeTab=='Contact Information'}}
    static content = {
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        tabSelect (wait:true) {$("div.ant-tabs-tab", text: "Contact Information")}

        updateManagerForm {module Form_UpdateManager}

        manager_name (wait:true) {$("td", 'data-label':"Mine Manager").find("p.p-large",1).text()}
        manager_date (wait:true) {$("td", 'data-label':"Manager Since").find("p.p-large",1).text()}
        manager_null_screen (required: false){$("h1", text:"No assigned mine manager")}
        addManagerButton (wait:true) {$("button").has("span",text:"Add Mine Manager")}     
        updateManagerButton (wait:true) {$("button").has("span", text:"Update Mine Manager")}   
    }

 
    def modifyManager(managerProfileData){
        if(manager_null_screen.present){ 
            addManagerButton.click()
        }
        else{ 
            updateManagerButton.click()
        }
        updateManagerForm.createPersonnel(managerProfileData)
        updateManagerForm.updateMineManager(managerProfileData)
    }

    def mineManagerCheck(managerProfileData){
        def nameUpdated = false
        def dateUpdated = false
        if(manager_name=="${managerProfileData.first_name} ${managerProfileData.surname}"){
            nameUpdated = true 
        } 
        if(manager_date==managerProfileData.date){
            dateUpdated = true
        }
        return [nameUpdated,dateUpdated]
    }   

    
}

 
        