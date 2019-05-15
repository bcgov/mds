#! /bin/bash
set -exv -o pipefail

# Chrome Tests
#./gradlew chromeTest -DchromeTest.single=CustomJUnitSpecRunner
#./gradlew chromeHeadlessTest -DchromeHeadlessTest.single=CustomJUnitSpecRunner

###FIREFOX HEADLESS IS THE ONLY BROWSER WHERE THE UPLOAD DOWNLOAD TEST CAN BE COMPLETED

# Config needed for firefoxHeadlessTest
# For more info: https://github.com/BCDevOps/BDDStack/wiki/Running-firefoxHeadlessTest-in-CentOS
Xvfb :1 -screen 0 1024x768x24 &
export DISPLAY=:1

###Run both Core and MineSpace tests
./gradlew firefoxHeadlessTest -DfirefoxHeadlessTest.single=CustomJUnitSpecRunner
./gradlew firefoxHeadlessTest -DfirefoxHeadlessTest.single=CustomJUnitPublicSpecRunner