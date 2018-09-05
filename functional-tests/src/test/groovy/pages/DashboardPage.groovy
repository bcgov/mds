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
        mineInfo (wait:true) {$("div.ant-row-flex").find("div.ant-col-4")}
        viewButton (wait:true) {$("button").has("span", text:"View Mine")}
        
        //search
        searchBox (wait:true){$("input", class:"ant-input")}
        resultList (required:false, wait: false) {$("ul", role: "listbox").find("li")}
        
        //pagination
        totalMineNum (wait:true) {$("li.ant-pagination-total-text").text()}
        pageinationSelection (wait:true) {$("div.ant-select-selection-selected-value")}
        25perPage (wait:true) {$("li.ant-select-dropdown-menu-item",text:"25 / page")}
        50perPage (wait:true) {$("li.ant-select-dropdown-menu-item",text:"50 / page")}
        75perPage (wait:true) {$("li.ant-select-dropdown-menu-item",text:"75 / page")}
        100perPage (wait:true) {$("li.ant-select-dropdown-menu-item",text:"100 / page")}
    }

    def mineInfoSelector (mineIndex){
        //select <mineIndex> row of mine info on dashboard
        def mineID = mineInfo[mineIndex*3].text()
        def mineName = mineInfo[mineIndex*3+1].text()
        return [mineID,mineName]
    }

    def selectRandomMine(){
        def mineToView = new Random().nextInt(viewButton.size())+1
        def mineSelected = ["",""] 
        if (viewButton.size()!= 0 ){
            mineSelected = mineInfoSelector(mineToView)
            println "mineSelected:  "+mineSelected
            viewButton[mineToView-1].click(); 
        } 
        return[mineSelected[0],mineSelected[1]]  
    }

    def dashboardValidation(mineToCheck){
        //check if last created mine record has the same NAME as mineToCheck
        def mineCreated = false
        println mineInfoSelector(viewButton.size())[1]
        println "-------------------"
        if (mineInfoSelector(viewButton.size())[1] == mineToCheck){
            
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
            def selectedMineID = resultList[mineToSelect].text().split(' - ')[1]
            resultList[mineToSelect].click()  
            return selectedMineID      
        }
    }


    def paginationSelection(page){
        int totalRecordNumber = totalMineNum.minus(" Results").toInteger()
        pageinationSelection.click()
        switch(page){
            case 25:
            25perPage.click()
            case 50:
            50perPage.click()
            case 75:
            75perPage.click()
            case 100:
            100perPage.click()
        }
    }


}