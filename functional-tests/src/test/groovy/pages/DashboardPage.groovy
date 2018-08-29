package pages

import geb.Page
import modules.*

class DashboardPage extends Page {
    static at = { title == "MDS"}
    static url = "dashboard"
    static content = {
        createMineForm { module CreateMineForm}
        mineName (wait:true) {$("div.ant-row-flex").find("div.ant-col-8")}
        mineID (wait:true) {$("div.ant-row-flex").find("div.ant-col-4")}
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
        //button
        viewButton (wait:true) {$("button").has("span", text:"View")}
        createMineButton (wait: true) {$("button").has("span", text:"Create Mine Record")}  
        
    }


    def selectRandomMine(){
        int totalMineNum = viewButton.size()  
        def mineToView = new Random().nextInt(totalMineNum)+1
        def viewMineName = ""
        def viewMineID = ""
        if (totalMineNum != 0 ){
            println totalMineNum
            println "mine to view:" + mineToView
            println mineName[2*mineToView].text()
            viewMineName = mineName[mineToView*2].text()
            viewMineID = mineID[mineToView*2].text()
            viewButton[mineToView-1].click(); 
        } 
        return[viewMineID,viewMineName]  
    }

    def validation(mineToCheck){
        def mineCreated = false
        //if the last created record has a matched mineName
        if (mineName[mineName.size()-2].text() == mineToCheck){
            mineCreated = true
        }                               
        return mineCreated
    }
}


 