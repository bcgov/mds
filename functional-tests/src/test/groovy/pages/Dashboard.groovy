package pages

import geb.Page
import modules.*

class Dashboard extends Page {
    static at = { waitFor() {!loadingScreen.displayed}}
    static url = "dashboard"
    static content = {
        //general
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
        loadingScreen (required:false) {$("div.loading-screen")}

        //create mine form
        createMineForm { module Form_CreateMine }
        createMineButton_Dashboard (wait: true) {$("button").has("span", text:"Create Mine Record")}

        //Dashboard
        first_mineID (wait:true) {$("div.ant-row-flex").find(id: "mine_list_id",0).text()}
        first_mineName (wait:true) {$("div.ant-row-flex").find(id: "mine_list_name",0).text()}
        viewLink (wait:true) {$("a", text: contains("MINETEST"))}

        //search
        searchBox (wait:true){$("input", id:"search")}
        resultList (required:false, wait: false) {$("ul", role: "listbox").find("li")}

        //pagination
        totalMineNum (wait:true) {$("li.ant-pagination-total-text").text()}
        paginationSelection (wait:true) {$("div.ant-select-selection-selected-value")}

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


    def search(keyword){
        def is_loading=true
        def currentResult = resultList[resultList.size()-1].text()
        def tempResult = currentResult
        def timeCheck = 0
        searchBox = keyword
        while (is_loading && timeCheck < 5 ) {
            if (tempResult == currentResult){
                tempResult =  currentResult
                sleep(200)
                timeCheck +=1
            }
            else{
                is_loading = false
            }

        }

    }

    def paginationSelection(page){
        int totalRecordNumber = totalMineNum.minus(" Results").toInteger()
        paginationSelection.click()
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