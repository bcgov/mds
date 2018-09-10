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
        updateButton (wait:true) {$("button").has("span",text:"Update")}

        //TabPanel
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        summaryTab (wait:true) {$("div.ant-tabs-tab", text: "Summary")}
        contactInfoTab (wait:true) {$("div.ant-tabs-tab", text: "Contact Information")}
        tenureTab (wait:true) {$("div.ant-tabs-tab", text: "Tenure")}

        //Summary Tab     
        
        

        //Tenure Tab
        addTenureNumberButton (wait:true) {$("div.center").find("button").has("span",text:"Add Tenure Number")}
        updateTenureForm {module UpdateTenureForm}
        tenureNumberList (wait:true) {$("div.ant-col-12")find("p.p-large").find("div")}
        noDataMessage (required: false){$("h1", text:"No data at this time")}
        
        //Contact info tab
        updateManagerForm {module UpdateManagerForm}
        mineManagerInfo (wait:true) {$("div.ant-col-12").find("p.p-large")}
        noManagerMessage (required: false){$("h1", text:"No Assigned Mine Manager")}
        addMineManagerButton (wait:true) {$("button").has("span",text:"Add Mine Manager")}
        
    }


    def addTenure(tenureNum){
        tenureTab.click()
        if(noDataMessage.present){
            addTenureNumberButton.click()
        }
        else{
            updateButton.click()
        }
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


    def modifyManager(FirstName,LastName,Date){
        if(noManagerMessage.present){
            addMineManagerButton.click()
        }
        else{
            updateButton.click()
        }
        updateManagerForm.createMineManager(FirstName,LastName)
        updateManagerForm.updateMineManager(FirstName,LastName,Date)
    }



    def mineManagerCheck(firstName,lastName,date){
        def nameUpdated = false
        def dateUpdated = false
        def i = mineManagerInfo.size()
        // println mineManagerInfo*.text()
        // println "--------------------"
        if(mineManagerInfo[i-2].text()=="${firstName} ${lastName}"){
            nameUpdated = true 
        }
        if(mineManagerInfo[i-1].text()==date){
            dateUpdated = true
        }
        return [nameUpdated,dateUpdated]
    }   
        
}
 