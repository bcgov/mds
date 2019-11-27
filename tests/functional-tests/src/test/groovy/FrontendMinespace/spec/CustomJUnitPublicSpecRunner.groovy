package spec

import org.junit.runner.RunWith
import org.junit.runners.Suite


@RunWith(Suite)
@Suite.SuiteClasses([
        LoginPublicFrontEndPageSpec.class,        
])

class CustomJUnitPublicSpecRunner {
}
