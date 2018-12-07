package modules

import geb.Module
import modules.Form_CreateTailings

class Tab_Tailings extends Module {
    static at = {waitFor() {activeTab=='Tailings'}}
    static content = {
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        tabSelect (wait:true) {$("div.ant-tabs-tab", text: "Tailings")}

        addTailingsForm {module Form_CreateTailings}
        document0Name (wait:true) {$("div.ant-row").find("h3")}
        addTailingsButton (wait:true) {$("button.ant-btn-primary").has("span", text:"Add a TSF")}

    }

    def addTailings(tsfData){
        addTailingsButton.click()
        addTailingsForm.addTailings(tsfData)
    }

}


