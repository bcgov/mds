package dataObjects

import groovy.transform.AutoClone
import groovy.transform.TupleConstructor

@AutoClone
@TupleConstructor

class MineContactDataOne {
    String  roleToggle,
            firstName,
            lastName,
            email,
            phoneNo,
            ext,
            suiteNo,
            streetAddress1,
            streetAddress2,
            provinceDropDown,
            city,
            postalCode
}

class MineContactDataTwo {
    String  role,
            mine,
            startDate,         
            endDate

    MineContactDataTwo(String role,String mine,String startDate,String endDate ){
      this.role=role
      this.mine=mine
      this.startDate=startDate
      this.endDate=endDate
    }
}

