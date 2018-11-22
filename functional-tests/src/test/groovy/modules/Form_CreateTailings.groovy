package modules

import geb.Module

class Form_CreateTailings extends Module {
    static at = { waitFor() {header=="Add a TSF"}}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        warning (wait: true) {$("div", 0, class:"ant-form-explain").find("span").text()}

        //mine profile input
        tsfName (wait:true) {$("input", id:"tsf_name")}

        //button
        createTSFButton (wait: true) {$("button.ant-btn-primary").has("span", text:"Add a TSF")}
        cancelButton (wait:true) {$("button.ant-btn-button").has("span", text:"Cancel")}

    }

    def addTailings(tsfData){
        tsfName = tsfData
        createTSFButton.click()
    }



}
