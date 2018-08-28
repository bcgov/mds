
package modules

import geb.Module

class CreateMineForm extends Module {
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        mineNameBox (wait:true) {$("input", id:"mineName")}
        createMineButton (wait: true) {$("button").has("span", text:"Create Mine")} 
        cancelButton (wait:true) {$("button").has("span", text:"Cancel")}      
        errorMessage (wait: true) {$("div", class:"ant-form-explain").text()}
        
    }

    def createMineRecord(mineName){
        mineNameBox = mineName
        createMineButton.click()             
    }
} 