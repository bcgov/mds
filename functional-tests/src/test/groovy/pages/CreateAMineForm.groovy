
package pages

import geb.Page

class CreateAMineForm extends Module {
    static content = {
        header {$("div", class:"ant-card-head-title").text()}
        mineNameBox (wait:true) {$("input", placeholder:"Mine Name")}
        createMineButton (wait: true) {$("button").has("span", text:"Create Mine")}       
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
        dashboardButton {$("button").has("span",text:"Dashboard")}
    }

    def createMineRecord(mineName){
        mineNameBox = mineName
        createMineButton.click()             
    }
} 