package pages

import geb.Page
import modules.*

class DashboardPage extends Page {
    static at = { title == "MDS"}
    static url = "dashboard"
    static content = {
        //general 
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
        //create mine form 
        createMineForm { module CreateMineForm}
        createMineButton (wait: true) {$("button").has("span", text:"Create Mine Record")}  

        //Dashboard
        mineName (wait:true) {$("div.ant-row-flex").find("div.ant-col-8")}
        mineID (wait:true) {$("div.ant-row-flex").find("div.ant-col-4")}
        viewButton (wait:true) {$("button").has("span", text:"View")}
        
        //search
        resultList (wait:true) {$("ul", role: "listbox").find("li")}
        searchBox (wait:true){$("input", class:"ant-input")}

        //pagination
        totalMineNum (wait:true) {$("li.ant-pagination-total-text").text()}
        recordPerPage (wait:true) {$()}
        
    }

    def selectRandomMine(){
        def mineToView = new Random().nextInt(viewButton.size())+1
        def viewMineName = ""
        def viewMineID = ""
        if (viewButton.size()!= 0 ){
            println viewButton.size()  
            println "mine to view:" + mineToView
            println mineName[2*mineToView].text()
            viewMineName = mineName[mineToView*2].text()
            viewMineID = mineID[mineToView*2].text()
            viewButton[mineToView-1].click(); 
        } 
        return[viewMineID,viewMineName]  
    }

    def dashboardValidation(mineToCheck){
        //check if last created mine record has the same NAME as mineToCheck
        def mineCreated = false
        if (mineName[mineName.size()-2].text() == mineToCheck){
            mineCreated = true
        }                               
        return mineCreated
    }

    def searchResultValidation(keyword){
        //check if the returned search results contains search keyword
        def goodSearch = true
        resultList.each{
            if(it.text().toLowerCase().contains(keyword.toLowerCase()!= true){
                goodSearch = false
            }
        }
        return goodSearch
    }

    def searchResultSelection(){
        //randomly select a mine from the search result list
        def mineToView = new Random().nextInt(resultList.size())+1
        
    }


    def paginationValidation(){
        int totalMineNumber = totalMineNum.minus(" Results").toInteger()
        println totalMineNumber
        return true
    }
    
}