package pages

import geb.Page

class Dashboard extends Page {
    static at = { header == "Mine Dashboard" }
    static content = {
        header {$("h1", 0).text()}
        mineRecord (wait:true) {$("div", class:"ant-row-flex").find(".ant-col-8")}
    }

    def mineRecordExists(mineName){
        def i = 0 //index
        //def j = 0 //number of mineName matched the created record
        def idFormat = true
        def mineCreated = false
        println mineRecord.size()//total number of rows
        if (mineRecord[mineRecord.size()-2].text() == mineName){
            //if the last created record has unmatched mineName
            mineCreated = true
        }
        mineRecord.each{ 
            //if is ID column   
            //check if ALL the mineID meets the "BLAHxxxx" format restriction
            if (i%3 == 0 && i != 0){
                if (!it.text().contains("BLAH")){
                    println it.text()
                    idFormat = false
                } 
            }
            i++
            /*
            //if is name column
            if ((i-1)%3 == 0){
                if (it.text() == mineName){
                    j++
                }  
            }
            */                            
        }
        //println "${j} match(es) found for mine named ${mineName}" 
        return [mineCreated,idFormat]
        //mineRecord.each{println "${it.text()}"}
    }

    def validation(mineName){
        def numOfNameOccurance
        def mineIDCorrectFormat
        def recordCreated = false
        def validID = false
        def temp
        temp = mineRecordExists(mineName)
        numOfNameOccurance = temp[0]    
        mineIDCorrectFormat = temp[1]
        if (numOfNameOccurance != 0){
            recordCreated = true
        }
        if (mineIDCorrectFormat){
            validID = true
        }
        return [recordCreated,validID]
    }
}