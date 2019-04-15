package modules

import geb.Module
import modules.Form_UpdateTenure

class Tab_Tenure extends Module {
    static at = {activeTab=='Tenure'}
    static content = {
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        tabSelect (wait:true) {$("div.ant-tabs-tab", text: "Tenure")}
        
        updateTenureForm {module Form_UpdateTenure}

        addTenureNumberButton (wait:true) {$("button").has("span",text:"Add Tenure Number")}
        tenureNumberList (wait:true) {$("td", 'data-label':"Tenure Numbers").find("p.p-large")}
        tenure_null_screen (required: false){$("h1", text:"No data available")}
    }

    def addTenure(tenureNum){ 
        addTenureNumberButton.click()
        updateTenureForm.addTenure(tenureNum)
    }

    def tenureUpdated(tenureNum){
        //check the LAST updated tenure number 
        def tenureUpdated = false
        def lastTenure = tenureNumberList.size() 
        if (tenureNumberList[lastTenure-1].text() == tenureNum) {
            tenureUpdated = true
        }
        return tenureUpdated
    }


    
}

 
        