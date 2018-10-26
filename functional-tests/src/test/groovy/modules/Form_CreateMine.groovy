package modules

import geb.Module

class Form_CreateMine extends Module {
    static at = { waitFor(5,0.5) {header=="Create Mine Record"}}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        warning (wait: true) {$("div", 0, class:"ant-form-explain").find("span").text()} 
        
        //mine profile input
        mineNameBox (wait:true) {$("input", id:"name")}
        statusLabel (wait:true) {$("span.ant-cascader-picker-label")}
        status_level1 (wait:true) {$("ul.ant-cascader-menu",0).find("li",1)}//Closed option
        status_level2 (wait:true) {$("ul.ant-cascader-menu",1).find("li",2)}//Orphaned
        status_level3 (wait:true) {$("ul.ant-cascader-menu",2).find("li",0)}//Long Term Maintenance
        
        latBox (wait:true) {$("input", id:"latitude")}
        longBox (wait:true) {$("input", id:"longitude")}
        notesBox (wait:true) {$("textarea", id:"note")}

        //button
        createMineButton (wait: true) {$("form.ant-form").find("div.center-mobile").find("button").has("span", text:"Create Mine Record")} 
        cancelButton (wait:true) {$("button.ant-modal-close")}      
        
    }

    def createMineRecord(mineProfileData){
        mineNameBox = mineProfileData.mine_name
        if (mineProfileData.mine_status != ""){
            statusLabel.click()
            status_level1.click()
            status_level2.click()
            status_level3.click()
            if(mineProfileData.latitude!=null){
                latBox=mineProfileData.latitude
            }
            if(mineProfileData.longtitude!=null){
                longBox=mineProfileData.longtitude
            }
            if(mineProfileData.notes!= ""){
                notesBox=mineProfileData.notes
            }
            createMineButton.click()
        }
        else{
            createMineButton.click() 
        }      
    }


        
} 
 