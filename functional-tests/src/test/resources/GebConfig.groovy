
/*
	This is the Geb configuration file.

	See: http://www.gebish.org/manual/current/#configuration
*/

import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.chrome.ChromeOptions
import org.openqa.selenium.firefox.*
import org.openqa.selenium.ie.InternetExplorerDriver
import org.openqa.selenium.edge.EdgeDriver
import org.openqa.selenium.remote.DesiredCapabilities
import utils.Const

//NOTE: This the upload/download currently only work in Chrome and Firefox-Headless browsers.
//Chrome-Headless does not work due to a known bug in the chrome headless driver.

//1.driver
//To run the tests with all browsers just run “./gradlew test”
environments {

	// run via “./gradlew chromeTest”
	// See: https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver
	chrome {
		driver = {
			ChromeOptions o = new ChromeOptions()
			o.addArguments("start-maximized")

			String downloadFilepath = Const.DOWNLOAD_PATH
			HashMap<String, Object> chromePrefs = new HashMap<String, Object>();
			chromePrefs.put("profile.default_content_settings.popups", 0);
			chromePrefs.put("download.default_directory", downloadFilepath);
			o.setExperimentalOption("prefs", chromePrefs);
			new ChromeDriver(o)
			}
	}

	// run via “./gradlew chromeHeadlessTest”
	// See: https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver
	chromeHeadless {
		driver = {
			ChromeOptions o = new ChromeOptions()
			o.addArguments('headless')
            o.addArguments('start-maximized')
			o.addArguments('disable-gpu')
			o.addArguments('no-sandbox')
			o.addArguments("window-size=1600,900")
			o.addArguments('--disable-popup-blocking')

			String downloadFilepath = Const.DOWNLOAD_PATH
			HashMap<String, Object> chromePrefs = new HashMap<String, Object>()
			chromePrefs.put("profile.default_content_settings.popups", 0);
			chromePrefs.put("download.default_directory", downloadFilepath)
			o.setExperimentalOption("prefs", chromePrefs)

			new ChromeDriver(o)
		}
	}

	// run via “./gradlew firefoxTest”
	// See: https://github.com/SeleniumHQ/selenium/wiki/FirefoxDriver
	firefox {
		driver = {
			FirefoxProfile profile = new FirefoxProfile();
			FirefoxOptions options = new FirefoxOptions();
			profile.setPreference("browser.download.folderList", 2);
			profile.setPreference("browser.helperApps.alwaysAsk.force", false);
			profile.setPreference("browser.download.manager.showAlertOnComplete", false);
			profile.setPreference("browser.download.manager.closeWhenDone", false);
			profile.setPreference("browser.download.panel.shown", false);

			//This forbid open with was found by visiting about:config
			options.addPreference("browser.download.forbid_open_with", true);
			options.addPreference("browser.helperApps.neverAsk.saveToDisk", "application/vnd.oasis.opendocument.text")
			options.setProfile(profile);
			options.addPreference("browser.download.dir", Const.DOWNLOAD_PATH);
			options.addPreference("browser.download.useDownloadDir", true);
			new FirefoxDriver(options);
		}
	}

	firefoxHeadless {
		driver = {
			FirefoxProfile profile = new FirefoxProfile();
			FirefoxOptions options = new FirefoxOptions();
			profile.setPreference("browser.download.folderList", 2);
			profile.setPreference("browser.helperApps.alwaysAsk.force", false);
			profile.setPreference("browser.download.manager.showAlertOnComplete", false);
			profile.setPreference("browser.download.manager.closeWhenDone", false);
			profile.setPreference("browser.download.panel.shown", false);
            options.setProfile(profile);

			//To find the settings that need to be modified, visit the about:config firefox url
			options.addPreference("browser.download.forbid_open_with", true);
			//In order to allow auto saving of files the user must specify the specific MIME types in a comma separated
			//string. (Cannot set all to true)
			options.addPreference("browser.helperApps.neverAsk.saveToDisk", "application/vnd.oasis.opendocument.text");
			options.addPreference("browser.download.dir", Const.DOWNLOAD_PATH);
			options.addPreference("browser.download.useDownloadDir", true);
			options.addArguments("--width=1920");
			options.addArguments("--height=1080");
			options.addArguments("--headless");

            FirefoxDriver firefoxDriver = new FirefoxDriver(options);
            firefoxDriver.manage().window().maximize();
            firefoxDriver;

		}
	}

	// run via “./gradlew ieTest”
	// See: https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver
	ie {
		def d = new DesiredCapabilities();
		d.setCapability(InternetExplorerDriver.INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS,true);
		d.setCapability(InternetExplorerDriver.IGNORE_ZOOM_SETTING,true);
		d.setCapability(InternetExplorerDriver.NATIVE_EVENTS,false);
		d.setCapability(InternetExplorerDriver.REQUIRE_WINDOW_FOCUS,true);

		driver = { new InternetExplorerDriver(d) }
	}

	// run via “./gradlew edgeTest”
	// See: https://github.com/SeleniumHQ/selenium/wiki
	edge {
		driver = { new EdgeDriver() }
	}
}



//2.root URL that all tests will pull from
// Allows for setting you baseurl in an environment variable.
// This is particularly handy for development and the pipeline
def env = System.getenv()
baseUrl = env['BASEURL']
if (!baseUrl) {
	baseUrl = "http://localhost:3000/"
}


//3. tells the test runner where to save the test results.
reportsDir = new File("target/geb-reports")
reportOnTestFailureOnly = false //true



//4.default value for waitFor() methods on browser, page and module objects
//in seconds
//If unspecified, the values of 5 for timeout and 0.1 for retryInterval.
waiting {
    timeout = 120
    retryInterval = 1
}
//always wait for the content using the default wait configuration
atCheckWaiting = true
//prevent Firefox driver times out when trying to find the root HTML element of the page
baseNavigatorWaiting = true


//5.  Driver caching
//If unspecified, the default caching behavior is to cache the driver globally across the JVM.
cacheDriverPerThread = true
//quit any cached browsers when the JVM exits
quitCachedDriverOnShutdown = true