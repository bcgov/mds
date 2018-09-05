## Usage

The following commands will launch the tests with the individual browsers:

    ./gradlew chromeTest
    ./gradlew chromeHeadlessTest //Will run in pipeline as well
    ./gradlew firefoxTest
    ./gradlew firefoxHeadlessTest //Will run in pipeline as well
    ./gradlew edgeTest //only on windows
    ./gradlew ieTest //Read wiki for set up instructions, only on windows
    ./gradlew safariTest //Only for MacOS, read wiki for instructions.
    
To run with all, you can run:

    ./gradlew test
    
    
To launch the tests in specific order with the individual browsers: (Required to ensure login is done before loading the app), use `-D<browserTest>.single=CustomJUnitSpecRunner <browserTest>`.
For example:

    ./gradlew clean -DchromeTest.single=CustomJUnitSpecRunner chromeTest
    ./gradlew clean -DchromeHeadlessTest.single=CustomJUnitSpecRunner chromeHeadlessTest
    
    

Replace `./gradlew` with `gradlew.bat` in the above examples if you're on Windows.

Report can be found under `/functional-tests/build/reports/tests`


