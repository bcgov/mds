package spec

import org.junit.runner.RunWith
import org.junit.runners.Suite

import utils.DataInit
import utils.DataCleanup


@RunWith(Suite)
@Suite.SuiteClasses([
        DataInit.class          ,
        A_LoginPageSpec.class   ,
        B_DashboardSpec.class   ,
        C_SummarySpec.class     ,
        D_PermitSpec.class      ,
        E_ContactInfoSpect.class,
        F_Tenure.class          ,
        DataCleanup.class
])

class CustomJUnitSpecRunner {
}