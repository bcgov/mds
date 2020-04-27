package spec

import geb.spock.GebReportingSpec
import spock.lang.*
import org.junit.Rule
import org.junit.rules.TemporaryFolder
import groovy.transform.SourceURI
import java.nio.file.Path
import java.nio.file.Paths

import pages.MineProfilePage
import utils.Const
import modules.Form_CreateTailings


@Title("MDS-MineProfilePage")
@Stepwise
class Tailings extends GebReportingSpec {

    @Rule
    TemporaryFolder dir = new TemporaryFolder()

    @SourceURI
    URI sourceUri
    Path scriptLocation = Paths.get(sourceUri)
    def setup(){
        def MineProfilePage = new MineProfilePage(url: "mine-dashboard/${Const.MINE_GUID}/mine-information/general")
        given: "User go to the mine profile page"
        to MineProfilePage
    }

    def "Scenario: User adds TSF to a mine"(){
        when: "User clicks the 'Add a TSF' button on the summary page and adds a TSF"
        createTSFDropdown.click()
        createTSFDropdownButton.click()
        tailingsTab.addTailingsForm.addTailings(Const.TSF_NAME)

        and: "The user sees a successful message"
        toastMessage == "Successfully added the TSF."
        // This needs to be declared after the main page since the url is a static variable
        def MineProfileTailingsPage = new MineProfilePage(url: "mine-dashboard/${Const.MINE_GUID}/reports/tailings")
        and: "The user goes to the tailings page."
        to MineProfileTailingsPage

        then: "the reports are visible"
        assert tailingsTab.document0Name != null
    }

    //TODO: THIS TEST ONLY WORKS IN CHROME AND FIREFOX-HEADLESS.  WORK IN GebConfig to fix other browsers
    def "Scenario: User is able to upload a TSF Report"(){
        def MineProfileTailingsPage = new MineProfilePage(url: "mine-dashboard/${Const.MINE_GUID}/reports/tailings")
        when: "User navigates to the TSF tab and clicks the upload icon"
        to MineProfileTailingsPage

        and: "User opens modal and uploads a valid file type and selects received date"
        def uploadedFile = dir.newFile(Const.TEST_FILE_NAME) << Const.TEST_FILE_CONTENT
        tailingsTab.addTailingsDocButtons[0].click()
        tailingsTab.uploadField = uploadedFile.absolutePath
        tailingsTab.receivedDate.click()
        tailingsTab.calendarInput = "2020-04-02"

        then: "The doc upload complete message is shown"
        assert tailingsTab.uploadCompleteMessage != null

        and: "Click save"
        tailingsTab.editReportButton[0].click()
    }

    //TODO: THIS TEST ONLY WORKS IN CHROME AND FIREFOX-HEADLESS.  WORK IN GebConfig to fix other browsers
    def "Scenario: User is able to download a TSF Report"() {
        def MineProfileTailingsPage = new MineProfilePage(url: "mine-dashboard/${Const.MINE_GUID}/reports/tailings")
        when: "User navigates to the TSF tab and clicks the download icon"
        to MineProfileTailingsPage

        and: "User opens a file in the folder specified in GebConfig"
        waitFor() { tailingsTab.downloadLink[0].click() }

        def file = new File(Const.DOWNLOAD_PATH+'/'+Const.TEST_FILE_NAME)
        // allow time for the file to be created in the DOWNLOAD_PATH
        waitFor(){ file.exists() && file.length() }
        String lineString = file.getText('UTF-8')
        file.delete()
        then: "The document is successfully downloaded"
        assert lineString == Const.TEST_FILE_CONTENT
    }


}
