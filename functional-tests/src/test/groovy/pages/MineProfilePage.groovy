package pages

import geb.Page
import modules.*

class MineProfilePage extends Page {
    static at = { title == "MDS"}
    static url = "dashboard/9c1b63b6-ccfb-48b0-be85-3cb3c5d1a276/summary/"
    static content = {
        //General
        mineName (wait:true) {$("h1",0).text()}
        mineNumber {$("h5",0).text().minus("Mine #: ")} 
        latValue (wait:true) {$("div")find("p",0).text()} 
        longValue (wait:true) {$("div")find("p",1).text()} 
        toastMessage (wait: true) {$("div.ant-notification-notice-message").text()}
        closeToastMessage (wait:true) {$("span.ant-notification-notice-close-x")} 

        //TabPanel
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        summaryTab (wait:true) {$("div.ant-tabs-tab", text: "Summary")}
        contactInfoTab (wait:true) {$("div.ant-tabs-tab", text: "Contact Information")}
        tenureTab (wait:true) {$("div.ant-tabs-tab", text: "Tenure")}

        //Summary Tab     
        
        //3.Contact info tab
        updateManagerForm {module UpdateManagerForm}
        manager_name (wait:true) {$("td", 'data-label':"Mine Manager").find("p.p-large",1).text()}
        manager_date (wait:true) {$("td", 'data-label':"Manager Since").find("p.p-large",1).text()}
        manager_null_screen (required: false){$("h1", text:"No assigned mine manager")}
        addManagerButton (wait:true) {$("button").has("span",text:"Add Mine Manager")}     
        updateManagerButton (wait:true) {$("button").has("span", text:"Update Mine Manager")}   

        //5.Tenure Tab
        addTenureNumberButton (wait:true) {$("button").has("span",text:"Add Tenure Number")}
        updateTenureForm {module UpdateTenureForm}
        tenureNumberList (wait:true) {$("td").find("p.p-large")}
        tenure_null_screen (required: false){$("h1", text:"No data available")}
    }


    //3.Contact Information Tab
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


    //5.Tenure Tab
    def addTenure(tenureNum){
        tenureTab.click()
        addTenureNumberButton.click()
        updateTenureForm.addTenure(tenureNum)
    }

    def tenureUpdated(tenureNum){
        //check the LAST updated tenure number
        tenureTab.click()
        def tenureUpdated = false
        def lastTenure = tenureNumberList.size()
        if (tenureNumberList[lastTenure-1].text() == tenureNum) {
            tenureUpdated = true
        }
        return tenureUpdated
    }

    def generateTenure(){
        def pool =  [0..9].flatten()
        Random random = new Random(System.currentTimeMillis())
        def temp = (0..6).collect{pool[random.nextInt(pool.size())] }
        def randomTenure = temp.join()
        return randomTenure
    }

}
 