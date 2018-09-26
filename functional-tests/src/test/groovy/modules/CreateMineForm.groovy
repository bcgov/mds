
package modules

import geb.Module

class CreateMineForm extends Module {
    static at = {$("div.ant-modal-title").text()=="Create Mine Record"}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        errorMessage (wait: true) {$("div", class:"ant-form-explain").text()}

        //input
        mineNameBox (wait:true) {$("input", id:"name")}
        latBox (wait:true) {$("input", id:"latitude")}
        longBox (wait:true) {$("input", id:"longitude")}


        //button
        createMineButton (wait: true) {$("button").has("span", text:"Create Mine")} 
        cancelButton (wait:true) {$("button.ant-modal-close")}      
        
    }

    def createMineRecord(mineName){
        mineNameBox = mineName
        createMineButton.click()             
    }

    def createMineRecordWithLocation(mineName,latitude,longitude){
        mineNameBox = mineName
        latBox = latitude
        longBox = longitude
        createMineButton.click()             
    }
} 