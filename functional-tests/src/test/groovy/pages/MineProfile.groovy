package pages

import geb.Page

class MineProfile extends Page {
    static at = { title == "MDS" }
    static url = "/dashboard"
    String convertToPath(Manual manual) {
        "/${manual.mineNo}/summary"
    } 
    static content = {
        //info
        //headerContactInfo (wait:true) {$("div").has("h1", text: "Contact Information")}
        //headerMineSummary (wait:true) {$("div").has("h1", text: "Mine Summary")}
        activeTab (wait:true) {$("div.ant-tabs-tabpane-active").find("h1").text()}
        mineName (wait:true) {$("h1",0).text()}
        mineProfile_NO {$("h2",0).text()}       
       // mineTenureNumberList (wait:true) {$("div.ant-row-flex",1).find("div.ant-col-6",3)}
        mineTenureNumber    (wait:true) {$("div.ant-col-6").find("div")}
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
        //input box
        tenureNumberBox (wait:true) {$("input", placeholder:"Tenure #")}
        //buttons
        summaryTab (wait:true) {$("div.ant-tabs-tab", text: "summary")}
        contactInfoTab (wait:true) {$("div.ant-tabs-tab", text: "Contact Information")}
        addTenureNumberButton (wait:true) {$("button").has("span",text:"Add Tenure Number")}
    }


    def addTenure(tenureNum){
        tenureNumberBox = tenureNum
        addTenureNumberButton.click()
    }

    def tenureUpdated(tenureNum){
        def tenureUpdated = false
        def lastTenure = mineTenureNumber.size()
        println "last Tenure: "+lastTenure
        println mineTenureNumber[lastTenure-1].text()
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

  
}

class Manual {
    String mineNo
}