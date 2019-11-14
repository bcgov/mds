package pages

import geb.Page
import modules.*
import utils.*

class Dashboard extends Page {
    static at = { waitFor() {!loadingScreen.displayed}}
    static url = "dashboard/mines"
    static pinSVGpath = "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z"

    static content = {
        //general
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
        loadingScreen (required:false) {$("div.loading-screen")}

        //navigation links
        contactPageButton (wait: true) {$("button").has("span", text:"Contacts")}
        mapTabButton (wait: true)  {$("div", role: 'tab').text("Map")}

        //create mine form
        createMineForm { module Form_CreateMine }
        createMineButton_Dashboard (wait: true) {$("button").has("span", text:"Create Mine Record")}

        //Dashboard
        viewLink (wait:true) {$("a", text: contains(Const.MINE_NAME))}
        firstMineName (wait:true) {$("a", text: contains(Const.MINE_NAME)).text()}

        //search
        searchBox (wait:true){$("input", id:"search")}
        resultList (required:false, wait: false) {$("ul", role: "listbox").find("li")}

        //pagination
        totalMineNum (wait:true) {$("li.ant-pagination-total-text").text()}
        paginationSelection (wait:true) {$("div.ant-select-selection-selected-value")}

        //map tab
        mapTabSelect (wait:true) {module Tab_Map_Module}
        map (wait:true) {$("div", class: "esri-display-object")}
        mapPin (wait:true) {$("path", path: pinSVGpath)}
        viewMineButton (wait:true) {$("button").has("span", text:"View Mine")}

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