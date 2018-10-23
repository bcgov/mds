package modules

import geb.Module

class UpdateTenureForm extends Module {
    static at = {header == "Add Tenure Number"}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        warningMessage (wait:true) {$("div", class:"ant-form-explain").find("span").text()}
        tenureNumberBox (wait:true) {$("input", id:"tenure_number_id")}
        addTenureNumberButton (wait:true) {$("form").find("div").find("button").has("span",text:"Add Tenure Number")}
    }

    def addTenure(tenureNum){
        tenureNumberBox = tenureNum
        addTenureNumberButton.click()
    }
}