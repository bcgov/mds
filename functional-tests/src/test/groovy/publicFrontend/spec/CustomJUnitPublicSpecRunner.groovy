package spec

import org.junit.runner.RunWith
import org.junit.runners.Suite

import utils.DataInit
import utils.DataCleanup


@RunWith(Suite)
@Suite.SuiteClasses([
        LoginPublicFrontEndPageSpec.class,        
])

class CustomJUnitPublicSpecRunner {
}
