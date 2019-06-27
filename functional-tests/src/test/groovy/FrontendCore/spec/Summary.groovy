package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*
import utils.*


@Title("MDS-MineProfilePage")
@Stepwise
class  SummarySpec extends GebReportingSpec {

    def setupSpec() {
        Thread.sleep(5)
    }

    def "Scenario: User can view the mine profile"(){
        when: "I go to the mine profile page for BLAH0000(the test record)"
        to MineProfilePage

        then: "I should see profile of the Mine"
        assert mineNumber == Const.MINE_NUMBER
        assert mineName == Const.MINE_NAME
    }
}



