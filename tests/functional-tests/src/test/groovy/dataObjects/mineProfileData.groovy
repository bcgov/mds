package dataObjects

import groovy.transform.AutoClone
import groovy.transform.TupleConstructor

@AutoClone
@TupleConstructor

class MineProfileData {
    String  mine_name   ,
            mine_status ,
            latitude    ,
            longtitude  ,
            notes
}