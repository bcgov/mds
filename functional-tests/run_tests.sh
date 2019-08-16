#! /bin/bash
set -exv -o pipefail

# Dry run project to cache gradle and dependencies
./gradlew -m

### Run MineSpace tests
./gradlew firefoxTest -DfirefoxTest.single=CustomJUnitPublicSpecRunner

### Run Core tests
# NOTE: FIREFOX HEADLESS IS THE ONLY BROWSER WHERE THE UPLOAD DOWNLOAD TEST CAN BE COMPLETED
./gradlew firefoxTest -DfirefoxTest.single=CustomJUnitSpecRunner