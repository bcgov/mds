package spec

import geb.spock.GebReportingSpec
import spock.lang.*
import org.junit.Rule
import org.junit.rules.TemporaryFolder
import org.openqa.selenium.Keys
import groovy.transform.SourceURI
import java.nio.file.Path
import java.nio.file.Paths

import pages.*
import utils.*


@Title("MDS-MineProfile-PermitTab")
@Stepwise
class  PermitSpec extends GebReportingSpec {

    @Rule
    TemporaryFolder dir = new TemporaryFolder()

    @SourceURI
    URI sourceUri
    Path scriptLocation = Paths.get(sourceUri)

    def setup() {
        to MineProfilePage
        permitTab.tabSelect.click()
    }

    // def "User can view permit"(){
    //     when:"I go to the permit tab"
    //     permitTab.tabSelect.click()

    //     then:"I should see a list of permit"
    //     assert permitTab.permit_no.text() != ''
    // }

    def "User can create a permit"(){
        when: "I click on the new permit"
        permitTab.newPermitButton.click()
        newPermitForm.completePermitForm()
        then: "A permit with the correct ID is present in the permit's tab"
        //TODO:  Remove the magic string
        permitTab.permitTitle.text() == "M-66666"

    }

    // This test is intermittant 
    def "User can edit the status of a permit"(){
        when: "I hover over the the add/edit button."
        
        println "The user is about to click add edit"
        permitTab.permitRow.children().has(text:"Add/Edit").click()// comment out for now
        println "The user has clicked add edit"
        sleep(10000)
        interact {
            moveToElement(footer)
            moveToElement(permitTab.permitRow.children().has(text:"Add/Edit")) 
        }
        // Keys.chord(keys.PAGE_DOWN)
        sleep(10000)
        and: "I click on the edit permit status."
        // println "The editPermitStatusButton is ${editPermitStatusButton}"
        interact {
            moveToElement(footer)
            moveToElement(permitTab.editPermitStatusButton) 
        }
        permitTab.editPermitStatusButton.click()
        println "Got to click edit permit status"

        and: "I change the status of the permit to closed."
        interact {
            moveToElement(footer)
            moveToElement(permitTab.editPermitFormStatusDropdown) 
        }
        permitTab.editPermitFormStatusDropdown.click()
        println "Got to status dropdown"

        permitTab.closedDropdownOption.click()
        permitTab.submitEditPermitStatus.click()
        println "Got to the then"

        // at MineProfilePage
        // permitTab.tabSelect.click()// comment out for now

        then: "The permit status has changed to closed"
        waitFor(permitTab)
        interact {
            moveToElement(footer)
        }
        footer.click()
        println "Footer clicked!"

        interact {
            moveToElement(footer)
            moveToElement(permitTab.permitRow.children().has(text:"Add/Edit")) 
        }
        // print("THE ROW OBJECT IS")
        // print(permitRow)
        // print("THE children are OBJECT IS \n")
        // permitRow.children().each {
        //     println "The text is ${it.text()}"
        // }
        // println "The status text is: ${(permitRow.children().has(title: "Status").text())}"
        permitTab.permitRow.children().has(title: "Status").text() == "Closed"
    }


    //TODO: Complete the other tests.

    //This test does not work on headless chrome
    def "User can upload a doc to a permit"(){
        when: "I open the edit initial permit modal."
        permitTab.permitRow.children().has(text:"Add/Edit").click()
        permitTab.openFileModalButton.click()
        
        and: "Upload a test file to the permit."
        def uploadedFile = dir.newFile(Const.TEST_FILE_NAME) << Const.TEST_FILE_CONTENT
        uploadField = uploadedFile.absolutePath
        uploadCompleteMessage
        permitTab.editPermitFileButton.click()

        then: "The file is attatched to the permit."
        permitTab.downloadTestFileLink.text() == Const.TEST_FILE_NAME

    }

    def "User can download a doc from a permit"(){
        when: "The user navigates to the test permit's files"
        permitTab.permitRow.children().has(text:"Add/Edit").click()
        // openFileModalButton.click()

        and: "User downloads the  test file"
        permitTab.downloadTestFileLink.click()
        print(Const.DOWNLOAD_PATH+'/'+Const.TEST_FILE_NAME)
        def file = new File(Const.DOWNLOAD_PATH+'/'+Const.TEST_FILE_NAME)
        //allow time for the file to be created in the DOWNLOAD_PATH
        //throw an error if it takes more than 20sec
        int counter = 0
        while (!file.exists()) {
            if (counter>=20 ){
                throw(new Error("Could not find the file"))
            }
            sleep(1000)
            counter++
        }
        String lineString = file.getText('UTF-8')
        file.delete()

        then: "The doc upload complete message is shown"
        assert lineString == Const.TEST_FILE_CONTENT
    }

    def "User can add an amendment to a permit"(){
        when: "A user opens the Add Permit Amendment Modal"
        //use the same hover method as was used at the start
        permitTab.permitRow.children().has(text:"Add/Edit").click()
        // This may not be working (or worse intermitantly working)
        interact {
            moveToElement(permitTab.permitRow.children().has(text:"Add/Edit")) 
        }
        permitTab.addAmendmentButton.click()

        and: "Completes all the fields"
        newPermitForm.completePermitAmendment()
        //open the permits ammendments list
        // permitRow.click()
        // permitRow.children().has(text:"Add/Edit").click()

        // interact {
        //     moveToElement(permitRow.children().has(text:"Add/Edit")) 
        // }   
        // permitRow.children().has(text:"Closed").click()
       
       
       
        permitTab.amendmentDescriptionSpecific
        // interact {
        //     moveToElement(amendmentDescriptionSpecific) 
        // } 
       
       
        then: "An Amendment is added to the permit in question"
        // amendmentDescriptionSpecific
        // amendmentDescriptions.children().has(text:"A fancy description" )
        
        // .each {
        //     println "The text is ${it.text()}"
        // }
        assert permitTab.amendmentDescriptions.children()[0].text()== "A fancy description"
        //assert that the ammendmant is first ([0])
        //assert that the values of the amendment are correct
    }
    
    // def "User can add an amalgamate a permit"(){
        
    // }


}
