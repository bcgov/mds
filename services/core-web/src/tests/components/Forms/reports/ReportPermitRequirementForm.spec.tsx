import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES, STATIC_CONTENT, PERMITS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { SystemFlagEnum, USER_ROLES } from "@mds/common";
import { ReportPermitRequirementForm } from "@/components/Forms/reports/ReportPermitRequirementForm";

const initialState = {
  [STATIC_CONTENT]: {
    mineReportStatusOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineReportStatusOptions,
    mineReportDefinitionOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineReportDefinitionOptions,
    permitConditionCategoryOptions:
      MOCK.BULK_STATIC_CONTENT_RESPONSE.permitConditionCategoryOptions,
  },
  [MINES]: MOCK.MINES,
  [PERMITS]: {
    permits: MOCK.PERMITS,
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
          onSubmit={() => {}}
          condition={MOCK.PERMITS[0].permit_amendments[0].conditions[0]}
        />
      </ReduxWrapper>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
