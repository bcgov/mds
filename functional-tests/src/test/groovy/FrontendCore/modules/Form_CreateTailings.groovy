package modules

import geb.Module

class Form_CreateTailings extends Module {
    static at = { waitFor() {header=="+ Add TSF"}}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        warning (wait: true) {$("div", 0, class:"ant-form-explain").find("span").text()}

        //mine profile input
        tsfName (wait:true) {$("input", id:"mine_tailings_storage_facility_name")}

        //button
        createTSFButton (wait: true) {$("button.ant-btn-primary").has("span", text:"+ Add TSF")}
        cancelButton (wait:true) {$("button.ant-btn-button").has("span", text:"Cancel")}

    }

    def addTailings(tsfData){
        tsfName = tsfData
        createTSFButton.click()
    }



}
