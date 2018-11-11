
/*
	This is the Geb configuration file.

	See: http://www.gebish.org/manual/current/#configuration
*/

import org.openqa.selenium.Dimension
import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.chrome.ChromeOptions
import org.openqa.selenium.firefox.FirefoxDriver
import org.openqa.selenium.firefox.FirefoxOptions
import org.openqa.selenium.ie.InternetExplorerDriver
import org.openqa.selenium.edge.EdgeDriver
import org.openqa.selenium.safari.SafariDriver
import org.openqa.selenium.remote.DesiredCapabilities

//1.driver
//To run the tests with all browsers just run “./gradlew test”
environments {

	// run via “./gradlew chromeTest”
	// See: https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver
	chrome {
		driver = {
			ChromeOptions o = new ChromeOptions()
			o.addArguments("start-maximized")
			new ChromeDriver(o)
			}
	}

	// run via “./gradlew chromeHeadlessTest”
	// See: https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver
	chromeHeadless {
		driver = {
			ChromeOptions o = new ChromeOptions()
			o.addArguments('headless')
			o.addArguments('disable-gpu')
			o.addArguments('no-sandbox')
			o.addArguments("window-size=1600,900")
			new ChromeDriver(o)
		}
	}

	// run via “./gradlew firefoxTest”
	// See: https://github.com/SeleniumHQ/selenium/wiki/FirefoxDriver
	firefox {
		driver = { new FirefoxDriver() }
	}

	firefoxHeadless {
		driver = {
			FirefoxOptions o = new FirefoxOptions()
			o.addArguments("-headless")
			new FirefoxDriver(o)
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

	// run via “./gradlew safariTest”
	// See: https://github.com/SeleniumHQ/selenium/wiki
	safari {
		driver = { new SafariDriver() }
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
    timeout = 30
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