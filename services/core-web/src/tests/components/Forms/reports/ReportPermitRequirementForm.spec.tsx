import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES, STATIC_CONTENT, PERMITS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { USER_ROLES } from "@mds/common/constants/environment";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { ReportPermitRequirementForm } from "@/components/Forms/reports/ReportPermitRequirementForm";
import { complianceReportReducerType, reportParamsGetAll } from "@mds/common/redux/slices/complianceReportsSlice";

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
    permitAmendments: MOCK.PERMIT_AMENDMENT_STATE,
  },
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [USER_ROLES.role_edit_reports],
  },
};

describe("RequestReportForm", () => {
  it("renders form properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ReportPermitRequirementForm
          permitGuid={MOCK.PERMITS[0].permit_guid}
          onSubmit={() => { }}
          condition={MOCK.PERMITS[0].permit_amendments[0].conditions[0]}
          canEditPermitConditions
          refreshData={jest.fn()}
          mineGuid={MOCK.PERMITS[0].mine_guid}
        />
      </ReduxWrapper>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
