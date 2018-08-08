package pages

import geb.Page

class HomePage extends Page {
    static at = { header == "Home"}
    static content = {
        header {$("div", class:"ant-card-head-title").text()}
        createMineButton (wait: true) {$("button").has("span", text:"Create A Mine")}    
        dashboardButton (wait:true){$("button").has("span",text:"View Mines")}
    }
}