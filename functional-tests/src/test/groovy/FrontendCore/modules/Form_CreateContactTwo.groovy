package modules

import geb.Module

class Form_CreateContactTwo extends Module {
    static at = { waitFor() {header=="Add New Contact"}}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}
        // warning (wait: true) {$("div", 0, class:"ant-form-explain").find("span").text()}

        //contact input
        role     (wait:true) {$("input", id:"mine_party_appt_type_code-1")}
        mine        (wait:true) {$("input", id:"search")}
        startDate         (wait:true) {$("input", name:"start_date-1")}
        startDate         (wait:true) {$("input", name:"end_date-1")}

        submitButton       (wait:true) {$("button").has("span", text:"Submit")}
    }

    def createContactFormTwo(mineContactDataTwo){
        mine = mineContactDataTwo.mine
                      
      
        submitButton.click()

    }
        //role toggle 

        //province dropdown
        
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
