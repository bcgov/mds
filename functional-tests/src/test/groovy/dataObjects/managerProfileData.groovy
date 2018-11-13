package dataObjects

import groovy.transform.AutoClone
import groovy.transform.TupleConstructor

@AutoClone
@TupleConstructor

class ManagerProfileData {
    String  first_name  ,
            surname     ,
            phone       ,
            ext         ,
            email       ,
            date

}