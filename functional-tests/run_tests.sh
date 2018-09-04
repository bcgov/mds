#! /bin/bash

 ./gradlew clean -DchromeHeadlessTest.single=CustomJUnitSpecRunner chromeHeadlessTest

# Config needed for firefoxHeadlessTest
# For more info: https://github.com/BCDevOps/BDDStack/wiki/Running-firefoxHeadlessTest-in-CentOS

Xvfb :1 -screen 0 1024x768x24 &
export DISPLAY=:1
 ./gradlew clean -DfirefoxHeadlessTest.single=CustomJUnitSpecRunner firefoxHeadlessTest