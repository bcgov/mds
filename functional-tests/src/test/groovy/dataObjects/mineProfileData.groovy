package dataObjects

import groovy.transform.AutoClone
import groovy.transform.TupleConstructor

@AutoClone
@TupleConstructor

class mineProfileData {
    String  mine_name   ,
            mine_status ,
            latitude    ,
            longtitude  ,
            notes   
}