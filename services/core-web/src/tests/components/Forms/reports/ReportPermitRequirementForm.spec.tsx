import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES, STATIC_CONTENT, PERMITS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { USER_ROLES } from "@mds/common/constants/environment";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { ReportPermitRequirementForm } from "@mds/common/components/permits/ReportPermitRequirementForm";
import { complianceReportReducerType, reportParamsGetAll } from "@mds/common/redux/slices/complianceReportsSlice";
import { PermitConditionsProvider } from "@mds/common/components/permits/PermitConditionsContext";

const initialState = {
  [STATIC_CONTENT]: {
    mineReportStatusOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineReportStatusOptions,
    permitConditionCategoryOptions:
      MOCK.BULK_STATIC_CONTENT_RESPONSE.permitConditionCategoryOptions,
  },
  [complianceReportReducerType]: {
    reportPageData: {
      records: MOCK.MINE_REPORT_DEFINITION_OPTIONS,
      current_page: 1,
      items_per_page: MOCK.MINE_REPORT_DEFINITION_OPTIONS.length,
      total: MOCK.MINE_REPORT_DEFINITION_OPTIONS.length,
      total_pages: 1
    },
    params: reportParamsGetAll,
  },
  [MINES]: MOCK.MINES,
  [PERMITS]: {
    permits: MOCK.PERMITS,
    latestPermitAmendments: MOCK.PERMIT_AMENDMENT_STATE,
  },
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [USER_ROLES.role_edit_reports],
  },
};

const providerParams = {
  mineGuid: MOCK.PERMITS[0].mine_guid,
  permitGuid: MOCK.PERMITS[0].permit_guid,
  latestAmendment: null,
  previousAmendment: null,
  currentAmendment: MOCK.PERMITS[0].permit_amendments[0],
  loading: false,
  setLoading: jest.fn(),
  refreshData: jest.fn(),
};

describe("RequestReportForm", () => {
  it("renders form properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <PermitConditionsProvider value={providerParams}>
          <ReportPermitRequirementForm
            canEditPermitConditions={true}
            refreshData={jest.fn()}
            condition={MOCK.PERMITS[0].permit_amendments[0].conditions[0]}
            isModal // isModal is passed by the modal wrapper
          />
        </PermitConditionsProvider>
      </ReduxWrapper>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
  it("renders view mode properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <PermitConditionsProvider value={providerParams}>
          <ReportPermitRequirementForm
            canEditPermitConditions={true}
            refreshData={jest.fn()}
            mineReportPermitRequirement={MOCK.PERMITS[0].permit_amendments[0].conditions[0].mineReportPermitRequirement}
          />
        </PermitConditionsProvider>
      </ReduxWrapper>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
