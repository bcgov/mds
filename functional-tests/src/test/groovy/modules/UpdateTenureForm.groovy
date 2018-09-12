package modules

import geb.Module

class UpdateTenureForm extends Module {
    static content = {
        warningMessage (wait:true) {$("div", class:"ant-form-explain").find("span").text()}
        tenureNumberBox (wait:true) {$("input", id:"tenureNumber")}
        addTenureNumberButton (wait:true) {$("div.right").find("button").has("span",text:"Add Tenure Number")}
    }

    def addTenure(tenureNum){
        tenureNumberBox = tenureNum
        addTenureNumberButton.click()
    }
}