
package pages

import geb.Page

class HomePage extends Page{
    static at = { title == "React App" }
    static content = {
        header (wait:true) {$("h1")}
        mineNameBox (wait:true) {$("input", placeholder:"Mine Name")}
        createMineRecordButton (wait: true) {$("button").has("span", text:"Create Mine")}       
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
        dashboardButton {$("button").has("span",text:"Dashboard")}
    }

    def createMineRecord(mineName){
        mineNameBox = mineName
        createMineRecordButton.click()        
         
    }
}