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
            mine

    MineContactDataTwo(String role,String mine){
      this.role=role
      this.mine=mine
    }
}

