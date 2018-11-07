package spec

import org.junit.runner.RunWith
import org.junit.runners.Suite

import utils.DataInit
import utils.DataCleanup


@RunWith(Suite)
@Suite.SuiteClasses([
        DataInit.class          ,
        LoginPageSpec.class   ,
        DashboardSpec.class   ,
        SummarySpec.class     ,
        PermitSpec.class      ,
        ContactInfoSpect.class,
        Tenure.class          ,
        DataCleanup.class
])

class CustomJUnitSpecRunner {
}