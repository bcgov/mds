package modules

import geb.Module

class Form_CreateContactOne extends Module {
    static at = { waitFor() {header=="Add New Contact"}}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}

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

    def createContactFormOne(mineContactData){

        if(mineContactData.roleToggle!=null){
            //select toggle
        }
        if(mineContactData.firstName!=null){
            firstName=mineContactData.firstName
        }
        if(mineContactData.lastName!=null){
            lastName=mineContactData.lastName
        }
        if(mineContactData.email!=null){
            email=mineContactData.email
        }
        if(mineContactData.phoneNo!=null){
            phoneNo=mineContactData.phoneNo
        }
        if(mineContactData.ext!=null){
            ext=mineContactData.ext
        }
        if(mineContactData.suiteNo!=null){
            suiteNo=mineContactData.suiteNo
        }
        if(mineContactData.streetAddress1!=null){
            streetAddress1=mineContactData.streetAddress1
        }
        if(mineContactData.streetAddress2!=null){
            streetAddress2=mineContactData.streetAddress2
        }
        if(mineContactData.provinceDropDown!=null){
            //not sure what needs doing
        }
        if(mineContactData.city!=null){
            city=mineContactData.city
        }
        if(mineContactData.postalCode!=null){
            postalCode=mineContactData.postalCode
        }                
      
        nextButton.click()

    }
      
}
