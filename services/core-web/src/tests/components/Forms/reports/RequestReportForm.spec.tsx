import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { RequestReportForm } from "@/components/Forms/reports/RequestReportForm";
import { USER_ROLES } from "@mds/common/constants/environment";
import { REPORT_TYPE_CODES, SystemFlagEnum } from "@mds/common/constants/enums";
import { complianceReportReducerType } from "@mds/common/redux/slices/complianceReportsSlice";

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
    }
  },
  [MINES]: MOCK.MINES,
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [USER_ROLES.role_edit_reports],
  },
};

describe("RequestReportForm", () => {
  it("renders form properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <RequestReportForm
          mineReportsType={REPORT_TYPE_CODES.CRR}
          mineGuid={MOCK.MINES.mineIds[0]}
          onSubmit={() => { }}
        />
      </ReduxWrapper>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
