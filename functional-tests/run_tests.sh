#! /bin/bash
set -exv -o pipefail

# NOTE: FIREFOX HEADLESS IS THE ONLY BROWSER WHERE THE UPLOAD DOWNLOAD TEST CAN BE COMPLETED

# Dry run project to cache gradle
./gradlew -m

### Run both Core and MineSpace tests
./gradlew firefoxHeadlessTest -DfirefoxHeadlessTest.single=CustomJUnitPublicSpecRunner
./gradlew firefoxHeadlessTest -DfirefoxHeadlessTest.single=CustomJUnitSpecRunner