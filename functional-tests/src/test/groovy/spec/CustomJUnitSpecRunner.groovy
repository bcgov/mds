package spec

import org.junit.runner.RunWith
import org.junit.runners.Suite

import utils.DataInit
import utils.DataCleanup


@RunWith(Suite)
@Suite.SuiteClasses([
        DataCleanup.class,
        DataInit.class,
        LoginPageSpec.class,
        DashboardSpec.class,
        SummarySpec.class,
        PermitSpec.class,
        ContactInfoSpec.class,
        Tenure.class,
        Tailings.class,
        DataCleanup.class
])

class CustomJUnitSpecRunner {
}
