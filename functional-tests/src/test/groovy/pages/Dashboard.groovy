package pages

import geb.Page

class Dashboard extends Page {
    static at = { header == "Mine Dashboard" }
    static content = {
        header {$("h1", 0).text()}
        mineRecord (wait:true) {$("div", class:"ant-row-flex").find(".ant-col-8")}
    }

    def mineRecordExists(mineName){
        def i = 0
        def name = mineName

        mineRecord.each{       
            if (it.text() == name){
                i++
                //println i
            }  
            //println it.text()         
        }
        println "${i} match(es) found for mine named ${name}" 
        return i
        //mineRecord.each{println "${it.text()}"}
    }
}