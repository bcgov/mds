package spec

import org.junit.runner.RunWith
import org.junit.runners.Suite

@RunWith(Suite)
@Suite.SuiteClasses([
        A_LoginPageSpec.class,
        B_DashboardSpec.class,
        C_MineProfileSpec.class
])

class CustomJUnitSpecRunner {
}