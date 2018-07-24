package spec

import geb.spock.GebReportingSpec
import spock.lang.*


import pages.*


@Title("MDS-HelloWorld")
@Narrative("At homepage, I should be able to click on 'click me' button, and see 'Hello World'")
@Stepwise

class HomePageTest extends GebReportingSpec {
    def "Scenario: User see 'HelloWorld' when then click the button"(){
        given: "I go to the homepage"
        to HomePage

        when: "I am on the homepage"
        clickMeButton.click()

     //   then: "I should see HelloWorld"
        then: "I see toast message"
        toastMessage == "Error!"
    
    }
}

