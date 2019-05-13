#! /bin/bash
set -exv -o pipefail

###FIREFOX HEADLESS IS THE ONLY BROWSER WHERE THE UPLOAD DOWNLOAD TEST CAN BE COMPLETED
#./gradlew chromeTest -DchromeTest.single=CustomJUnitSpecRunner
#./gradlew chromeHeadlessTest -DchromeHeadlessTest.single=CustomJUnitSpecRunner
# ./gradlew firefoxHeadlessTest -DfirefoxHeadlessTest.single=CustomJUnitSpecRunner
###Run both Core and MineSpace tests
Xvfb :1 -screen 0 1024x768x24 &
export DISPLAY=:1
./gradlew firefoxHeadlessTest -DfirefoxHeadlessTest.single=CustomJUnitSpecRunner
./gradlew firefoxHeadlessTest -DfirefoxHeadlessTest.single=CustomJUnitPublicSpecRunner

# Config needed for firefoxHeadlessTest
# For more info: https://github.com/BCDevOps/BDDStack/wiki/Running-firefoxHeadlessTest-in-CentOS

# Firefox tests are currently disabled as the user base only uses chrome or IE
#  ./gradlew clean -DfirefoxHeadlessTest.single=CustomJUnitSpecRunner firefoxHeadlessTest