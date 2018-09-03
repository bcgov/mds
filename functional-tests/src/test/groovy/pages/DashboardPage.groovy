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
        //resultList (required:false, wait: true) {$("div.slide-up-leave").find("div").find("ul", role: "listbox").find("li")}
        searchBox (wait:true){$("input", class:"ant-input")}
        resultList (required:false, wait: false) {$("ul", role: "listbox").find("li")}
        //pagination
        totalMineNum (wait:true) {$("li.ant-pagination-total-text").text()}
        recordPerPage (wait:true) {$()}
        

        // //single result
        // ant-select-dropdown ant-select-dropdown--single ant-select-dropdown-placement-bottomLeft slide-up-leave
        // //multiple result
        // ant-select-dropdown ant-select-dropdown--single ant-select-dropdown-placement-bottomLeft slide-up-leave slide-up-leave-active
        // //none
        // ant-select-dropdown ant-select-dropdown--single ant-select-dropdown-placement-bottomLeft  ant-select-dropdown-hidden
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
        def goodSearch = false
        if (resultList.present){
            resultList.each{
                if(it.text().toLowerCase().contains(keyword.toLowerCase())== true || it.text()==""){
                    goodSearch = true
                }
                else{
                    goodSearch = false
                    return goodSearch
                }
            }
        }
        else{//empty list
            goodSearch = true
        }
        return goodSearch
    }

    def searchResultSelection(){
        //randomly select a mine from the search result list
        if (resultList.present){
            int mineToSelect = new Random().nextInt(resultList.size())
            println mineToSelect
            println resultList[mineToSelect].text().minus(".* - ")
            resultList[mineToSelect].click()

            
        }
    }


    def paginationValidation(){
        int totalMineNumber = totalMineNum.minus(" Results").toInteger()
        println totalMineNumber
        return true
    }
    
}