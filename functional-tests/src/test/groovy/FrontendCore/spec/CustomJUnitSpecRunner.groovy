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
        // SummarySpec.class,
        PermitSpec.class,
        ContactInfoSpec.class,
        // Tailings.class,
        Contacts.class,
        // MapNavigationSpec.class,//TODO: UNCOMEMENT WHEN MDS-1924 IS DONE
        DataCleanup.class,
])

class CustomJUnitSpecRunner {
}
