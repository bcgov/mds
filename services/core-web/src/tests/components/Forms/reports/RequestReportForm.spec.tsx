import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { REPORT_TYPE_CODES, SystemFlagEnum, USER_ROLES } from "@mds/common";
import { RequestReportForm } from "@/components/Forms/reports/RequestReportForm";

const initialState = {
  [STATIC_CONTENT]: {
    mineReportStatusOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineReportStatusOptions,
    mineReportDefinitionOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineReportDefinitionOptions,
    permitConditionCategoryOptions:
      MOCK.BULK_STATIC_CONTENT_RESPONSE.permitConditionCategoryOptions,
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
          onSubmit={() => {}}
        />
      </ReduxWrapper>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
