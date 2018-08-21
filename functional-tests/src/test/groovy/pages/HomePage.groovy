package pages

import geb.Page

class HomePage extends Page {
    static at = { header == "Mines"}
    static content = {
        header {$("div.ant-card-head-title").text()}
        createMineButton (wait: true) {$("button").has("span", text:"Create Mine Record")}  
        mineName (wait:true) {$("div.ant-row-flex").find("div.ant-col-8")}
        mineID (wait:true) {$("div.ant-row-flex").find("div.ant-col-4")}
        viewButton (wait:true) {$("button").has("span", text:"View")}
    }


    def selectRandomMine(){
        def totalMineNum = viewButton.size()  
        def mineToView = Math.abs(new Random().nextInt() % totalMineNum + 1) //return 1-totalMineNum (inclusive)
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
        println "return viewMineID " + viewMineID
        println "return mineName " + viewMineName
        return[viewMineID,viewMineName]  
    }

    def validation(mineToCheck){
        def mineCreated = false
        //if the last created record has a matched mineName
        println "mineToCheck"+mineToCheck
        println "mineName: "+mineName[mineName.size()-2].text()
        if (mineName[mineName.size()-2].text() == mineToCheck){
            mineCreated = true
        }                               
        return mineCreated
    }
}


 