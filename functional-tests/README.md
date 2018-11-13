# Functional Test Automation

This project automates a selection of functional tests on multiple browsers using Geb integrated with Spock and Gradle. It helps to efficiently check if the addition of new features or bug fixes has broke any previously developed features.

## Tools

* [Geb](http://www.gebish.org/manual/current/)

A Selenium WebDriver wrapper which integrates well with Groovy and Spock syntax and provides flexibility working with multiple browsers and simplicity on writing tests.

* [Spock](http://spockframework.org/)

A testing framework whose Arrange-Act-Assert structure best matches the BDD's(Behaviour Driven Development) Given-When-Then scenario description format.

* [Gradle](https://gradle.org/)

A build tool to build the groovy project and manage its dependencies.

## Folder Structure

- `build.gradle`                : Build configuration for Gradle
- `gradle.properties`           : Environment properties used in the Gradle build
- `gradlew(.bat)`               : Gradle runner executable
- `src/test/groovy/resources`   : Configuration for Geb
- `src/test/groovy/spec`        : Specification for test cases/scenarios
- `src/test/groovy/data`        : SQL to create/delete test data directly from the DB
- `src/test/groovy/modules` and `src/test/pages` : Definition of modules/pages in the app
- `src/test/groovy/utils`       : Constants being used in the test script


## Environment Setup

Follow the `.env-example` template to create an `.env` file under `/functional-tests` with valid IDIR credentials and database connection information before running the test.

## Run tests with Gradle

The following commands will launch the tests with the individual browsers:

    ./gradlew chromeTest -DchromeTest.single=CustomJUnitSpecRunner
    ./gradlew chromeHeadlessTest -DchromeHeadlessTest.single=CustomJUnitSpecRunner  //Will run in pipeline as well
    ./gradlew firefoxTest -DfirefoxTest.single=CustomJUnitSpecRunner
    ./gradlew firefoxHeadlessTest -DfirefoxHeadlessTest.single=CustomJUnitSpecRunner //Will run in pipeline as well

- Replace `./gradlew` with `gradlew.bat` in the above examples if you're on Windows.

Only on windows:

    gradlew.bat edgeTest -DedgeTest.single=CustomJUnitSpecRunner
    gradlew.bat ieTest -DieTest.single=CustomJUnitSpecRunner

Only on MacOS:

    ./gradlew safariTest -DsafariTest.single=CustomJUnitSpecRunner



## Test Report

Report can be found under `/functional-tests/build/reports/tests`


