# Functional Test Automation

This project automates a selection of functional tests on multiple browsers
using Geb integrated with Spock and Gradle. It helps to varify that new changes
have not created regressions. The test strategy for this project is discussed on
the mds confluence page:
https://apps.nrs.gov.bc.ca/int/confluence/pages/viewpage.action?pageId=39651197
(accessing this page will require IDIR login)

## Tools

### [Geb](http://www.gebish.org/manual/current/)

A Selenium WebDriver wrapper which integrates well with Groovy and Spock syntax
and provides flexibility working with multiple browsers and simplicity on
writing tests.

### [Spock](http://spockframework.org/)

A testing framework whose Arrange-Act-Assert structure best matches the
BDD's(Behaviour Driven Development) Given-When-Then scenario description
format.

### [Gradle](https://gradle.org/)

A build tool to build the groovy project and manage its dependencies.

## Folder Structure

- `build.gradle` : Build configuration for Gradle
- `gradle.properties` : Environment properties used in the Gradle build
- `gradlew(.bat)` : Gradle runner executable
- `src/test/groovy/resources` : Configuration for Geb
- `src/test/groovy/<Project Name>/spec` : Specification for test cases/scenarios
- `src/test/groovy/data` : SQL to create/delete test data directly from the DB
- `src/test/groovy/<Project Name>/modules` and `src/test/<Project Name>/pages` : Definition of modules/pages in the app
- `src/test/groovy/utils` : Constants being used in the test script

## Setup

Follow the `.env-example` template to create an `.env` file under
`/functional-tests` with valid IDIR credentials and database connection
information before running the test.

## Running

The following commands will launch the tests with the individual browsers.
They must be run in the functional test (current) directory.
The minespace-frontend tests are run by replacing CustomJUnitSpecRunner with CustomJUnitPublicSpecRunner

The shell script controlling how the tests in the pipeline are run is
run_test.sh. If new test suites need to be added to the GEB testing process
this is where they will be added.

### Run with gradle

The core frontend tests here will be run with the following commands
./gradlew chromeTest -DchromeTest.single=CustomJUnitSpecRunner
./gradlew chromeHeadlessTest -DchromeHeadlessTest.single=CustomJUnitSpecRunner //download tsf test will fail due to chrome-headless bug
./gradlew firefoxTest -DfirefoxTest.single=CustomJUnitSpecRunner
./gradlew firefoxHeadlessTest -DfirefoxHeadlessTest.single=CustomJUnitSpecRunner

- Replace `./gradlew` with `gradlew.bat` in the above examples if you're on Windows.

Only on windows:

    gradlew.bat edgeTest -DedgeTest.single=CustomJUnitSpecRunner
    gradlew.bat ieTest -DieTest.single=CustomJUnitSpecRunner

### Test Report

Report can be found under `/functional-tests/build/reports/tests`

## Troubleshooting

### Data clean up fails

This often occurs when a new table is added to the database and the clean up
script attempts to delete a linked table. Often running the test on a clean
database will work. Though sometimes the data_deletion.sql script will have to
be modified to delete dependancies before proceeding.

### The login test fails locally

If you've never managed to run the functional tests locally before, confirm
that your .env file matches the .env example. You will need to get the
password from openshift secrets.

### Data clean up error: role "mds" does not exist

You may be running postgres locally for a different project. You should
stop that process and then run `make db` in the project root.
