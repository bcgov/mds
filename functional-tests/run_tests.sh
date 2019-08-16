#! /bin/bash
set -exv -o pipefail

# NOTE: FIREFOX HEADLESS IS THE ONLY BROWSER WHERE THE UPLOAD DOWNLOAD TEST CAN BE COMPLETED

### Run both Core and MineSpace tests
./gradlew firefoxTest -DfirefoxTest.single=CustomJUnitPublicSpecRunner
./gradlew firefoxTest -DfirefoxTest.single=CustomJUnitSpecRunner