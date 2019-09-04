package modules

import geb.Module

class Form_CreateMine extends Module {
    static at = { waitFor() {header=="Create Mine Record"}}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        warning (wait: true) {$("div", 0, class:"ant-form-explain").find("span").text()}

        //mine profile input
        mineNameBox (wait:true) {$("input", id:"mine_name")}
        statusLabel (wait:true) {$("span.ant-cascader-picker")}
        status_level1 (wait:true) {$("li", text: "Closed")}

        regionLabel (wait:true) {$("#mine_region.ant-select-enabled")}
        region_1 (wait:true) {$("ul.ant-select-dropdown-menu",0).has("li", text: "South West")}//South West

        latBox (wait:true) {$("input", id:"latitude")}
        longBox (wait:true) {$("input", id:"longitude")}
        notesBox (wait:true) {$("textarea", id:"mine_note")}

        //button
        createMineButton (wait: true) {$("form.ant-form").find("div.center-mobile").find("button").has("span", text:"Create Mine Record")}
        cancelButton (wait:true) {$("button.ant-modal-close")}

    }

    def createMineRecord(mineProfileData){
        mineNameBox = mineProfileData.mine_name
        if (mineProfileData.mine_status != ""){
            statusLabel.click()
            status_level1.click()

            regionLabel.click()
            region_1.click()
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
