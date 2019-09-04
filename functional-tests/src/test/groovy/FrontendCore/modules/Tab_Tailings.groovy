package modules

import geb.Module
import modules.Form_CreateTailings
import utils.Const

class Tab_Tailings extends Module {
    static at = {waitFor() {activeTab=='Tailings'}}
    static content = {
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        tabSelect (wait:true) {$("div.ant-tabs-tab", text: "Tailings")}
        addTailingsForm {module Form_CreateTailings}
        document0Name (wait:true) {$("div.ant-row").find("h3")}
        addTailingsButton (wait:true) {$("button.ant-btn-primary").has("span", text:"Add a TSF")}
        addTailingsDocButtons (wait:true) {$("button.ant-btn").has('img',alt: "Edit Report")}
        //File upload modal objects
        uploadField (wait:true) {$("input.filepond--browser")}
        uploadCompleteMessage (wait:true) {$("span.filepond--file-status-main", text:"Upload complete")}
        //File download link object
        downloadLink (wait:true) {$('a',text:Const.TEST_FILE_NAME)}
        editReportButton (wait:true) {$("button.ant-btn-primary").has("span", text:contains("Edit report for"))}
    }

    def addTailings(tsfData){
        addTailingsButton.click()
        addTailingsForm.addTailings(tsfData)
    }

}


