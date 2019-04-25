package modules

import geb.Module
import utils.Const

class Form_CreateContact extends Module {
    static at = { waitFor() {header=="Add New Contact"}}
    static content = {
        header {$("div", id:"rcDialogTitle0").text()}

        //Part one of contact form
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

        //Part two of contact form
        addRoleButton (wait:true) {$("button").has("span", text:"Add Role")}
        roleClick     (wait:true) {$("div", id:"mine_party_appt_type_code-1", class:"ant-select ant-select-enabled")}
        role          (wait:true) {$("input", id:"mine_party_appt_type_code-1")}
        mine          (wait:true) {$("input", id:"search")}
        startDate     (wait:true) {$("input", name:"start_date-1")}
        endDate       (wait:true) {$("input", name:"end_date-1")}
        minePopulated (wait:true) {$("li", text:Const.MINE_NAME_2)}
        submitButton  (wait:true) {$("button").has("span", text:"Submit")}
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


    def createContactFormTwo(mineContactDataTwo){
        waitFor() {header=="Add New Contact"}
        addRoleButton.click()
        roleClick.click()
        role = mineContactDataTwo.role
        mine = mineContactDataTwo.mine
        
        minePopulated.click()
        submitButton.click()
    }
      
}
