package pages

import geb.Page

class MineProfilePage extends Page {
    static at = { title == "MDS" }
    static content = {
        //General
        activeTab (wait:true) {$("div.ant-tabs-tabpane-active").find("h1").text()}
        summaryTab (wait:true) {$("div.ant-tabs-tab", text: "summary")}
        contactInfoTab (wait:true) {$("div.ant-tabs-tab", text: "Contact Information")}
        mineName (wait:true) {$("h1",0).text()}
        mineProfile_NO {$("h2",0).text()}  
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
        closeToastMessage (wait:true) {$("span.ant-notification-notice-close-x")}

        //Summary Tab     
        mineTenureNumber    (wait:true) {$("div.ant-col-6").find("div")}
        

        //Tenure number form
        warningMessage (wait:true) {$("div", class:"ant-form-explain").find("span").text()}
        tenureNumberBox (wait:true) {$("input", id:"tenureNumber")}
        addTenureNumberButton (wait:true) {$("button").has("span",text:"Add Tenure Number")}
        
        //Contact info tab
        selectToInputManager (wait:true) {$("div", class:"ant-select-selection ant-select-selection--single")}
        updateButton (wait:true) {$("button").has("span",text:"Update")}
        mineManagerInfo (wait:true) {$("div.ant-row").find("div.ant-col-12").find("div")}
        //effectiveDateInfo (wait:true) {$("div.ant-col-12").find("div")}


        //update mine manager form
        managerFirstNameBox (wait:true) {$("input", id:"first_name")}
        managerSurNameBox (wait:true) {$("input", id:"surname")}
        managerSelectNameBox (wait:true) {$("input", id:"mineManager")}
        datePicker1 (wait:true) {$("input", class:"ant-calendar-picker-input ant-input")}
        datePicker2 (wait:true) {$("input.ant-calendar-input", placeholder:"Select date")}
        createMineManagerButton (wait:true) {$("button").has("span",text:"Create Personnel")}
        updateMineManagerButton (wait:true) {$("button").has("span",text:"Update Mine Manager")} 
    }


    def addTenure(tenureNum){
        tenureNumberBox = tenureNum
        addTenureNumberButton.click()
    }

    def tenureUpdated(tenureNum){
        //check the LAST updated tenure number
        def tenureUpdated = false
        def lastTenure = mineTenureNumber.size()
        if (mineTenureNumber[lastTenure-1].text() == tenureNum) {
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


    def selectDate(date){
        datePicker1.click()
        datePicker2.click()
        datePicker2=date
    }


    def createMineManager(firstName,lastName){
        updateButton.click()
        managerFirstNameBox = firstName
        managerSurNameBox = lastName
        createMineManagerButton.click()
        if (toastMessage=="Error!"){
            closeToastMessage.click()
        }
        if (toastMessage == "Successfully created: ${firstName} ${lastName}"){
            closeToastMessage.click()
        }
    }

    def updateMineManager(firstName,lastName,date){
        selectToInputManager.click()
        managerSelectNameBox = "${firstName} ${lastName}"
        selectDate(date)
        updateMineManagerButton.click()
    }


    def mineManagerCheck(firstName,lastName,date){
        def nameUpdated = false
        def dateUpdated = false
        int i = mineManagerInfo.size()
        if(mineManagerInfo[i-2].text()=="${firstName} ${lastName}"){
            nameUpdated = true 
        }
        if(mineManagerInfo[i-1].text()==date){
            dateUpdated = true
        }
        return [nameUpdated,dateUpdated]
    }   
        
}
 