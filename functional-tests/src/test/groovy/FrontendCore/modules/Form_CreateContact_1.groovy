package modules

import geb.Module

class Form_CreateContact_1 extends Module {
    static at = { waitFor() {header=="Add New Contact"}}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        // warning (wait: true) {$("div", 0, class:"ant-form-explain").find("span").text()}

        //contact input
        roleToggle       (wait:true) {$("input", type:"radio")}
        firstName        (wait:true) {$("input", id:"first_name")}
        lastName         (wait:true) {$("input", id:"party_name")}
        email            (wait:true) {$("input", id:"email")}
        phoneNo          (wait:true) {$("input", id:"phone_no")}
        ext              (wait:true) {$("input", id:"phone_ext")}
        suiteNo          (wait:true) {$("input", id:"suite_no")}
        streetAddress1   (wait:true) {$("input", id:"address_line_1")} 
        streetAddress2   (wait:true) {$("input", id:"address_line_2")} 
        provinceDropDown (wait:true) {$("input", id:"sub_division_code")} 
        city             (wait:true) {$("input", id:"city")}
        postalCode       (wait:true) {$("input", id:"post_code")}

        nextButton       (wait:true) {$("button").has("span", text:"Next")}
    }

    // def createMineRecord(mineProfileData){
    //     mineNameBox = mineProfileData.mine_name
    //     if (mineProfileData.mine_status != ""){
    //         statusLabel.click()
    //         status_level1.click()
    //         status_level2.click()
    //         status_level3.click()

    //         regionLabel.click()
    //         region_1.click()
    //         if(mineProfileData.latitude!=null){
    //             latBox=mineProfileData.latitude
    //         }
    //         if(mineProfileData.longtitude!=null){
    //             longBox=mineProfileData.longtitude
    //         }
    //         if(mineProfileData.notes!= ""){
    //             notesBox=mineProfileData.notes
    //         }
    //         createMineButton.click()
    //     }
    //     else{
    //         createMineButton.click()
    //     }
    // }



}
