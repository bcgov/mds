package pages

import geb.Page

class Dashboard extends Page {
    static at = { header == "Mine Dashboard" }
    static content = {
        header {$("h1", 0).text()}
        mineName {$("div", class:"ant-row-flex").find(".ant-col-8")[1]}
    }

    def mineRecordExists(mineName){
        mineName.each{it.text().contains(mineName)}
    }
}