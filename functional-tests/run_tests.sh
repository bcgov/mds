#! /bin/bash
set -exv -o pipefail

# NOTE: FIREFOX HEADLESS IS THE ONLY BROWSER WHERE THE UPLOAD DOWNLOAD TEST CAN BE COMPLETED

# Config needed for firefoxest
# For more info: https://github.com/BCDevOps/BDDStack/wiki/Running-firefoxHeadlessTest-in-CentOS
Xvfb :1 -screen 0 1920x1080x24 &
export DISPLAY=:1

### Run both Core and MineSpace tests
./gradlew firefoxTest -DfirefoxTest.single=CustomJUnitSpecRunner
./gradlew firefoxTest -DfirefoxTest.single=CustomJUnitPublicSpecRunner