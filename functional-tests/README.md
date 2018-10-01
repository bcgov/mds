# Functional Test Automation

This project automates a selection of functional tests on multiple browsers using Geb integrated with Spock and Gradle. It helps to efficiently check if the addition of new features or bug fixes has broke any previously developed features.

## Tools
 
* [Geb](http://www.gebish.org/manual/current/)

A Selenium WebDriver wrapper integrated with Groovy and Spock syntax which provides flexibility to work with multiple browsers and simplicity to write tests.

* [Spock](http://spockframework.org/)

A testing framework which is a great match for Geb.

* [Gradle](https://gradle.org/)

A build tool to build the groovy project and manage its dependencies.


## Environment Setup

Follow the `.env-example` template to create an `.env` file under `/functional-tests` with valid IDIR credentials and database connection information before running the test.

## Run tests with Gradle
    
The following commands will launch the tests with the individual browsers:

    ./gradlew -DchromeTest.single=CustomJUnitSpecRunner chromeTest
    ./gradlew -DchromeHeadlessTest.single=CustomJUnitSpecRunner chromeHeadlessTest  //Will run in pipeline as well
    ./gradlew -DfirefoxTest.single=CustomJUnitSpecRunner
    ./gradlew -DfirefoxHeadlessTest.single=CustomJUnitSpecRunner firefoxHeadlessTest //Will run in pipeline as well
    
- Replace `./gradlew` with `gradlew.bat` in the above examples if you're on Windows.

Only on windows:

    gradlew.bat -DedgeTest.single=CustomJUnitSpecRunner edgeTest 
    gradlew.bat -DieTest.single=CustomJUnitSpecRunner ieTest 
    
Only on MacOS:

    ./gradlew -DsafariTest.single=CustomJUnitSpecRunner safariTest 
    
    

## Test Report

Report can be found under `/functional-tests/build/reports/tests`


