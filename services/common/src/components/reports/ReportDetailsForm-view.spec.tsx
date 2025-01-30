import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ReportDetailsForm from "./ReportDetailsForm";
import { Button } from "antd";
import { AUTHENTICATION, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { USER_ROLES } from "@mds/common/constants/environment";
import { IMineReportSubmission } from "@mds/common/interfaces/reports/mineReportSubmission.interface";
import { complianceReportReducerType } from "@mds/common/redux/slices/complianceReportsSlice";

const mineReportSubmission = MOCK.MINE_REPORT_SUBMISSIONS[0];
const initialState = {
  reportSubmission: {
    reportSubmission: mineReportSubmission,
    mineReportGuid: mineReportSubmission.mine_report_guid,
  },
  [STATIC_CONTENT]: {
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
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [USER_ROLES.role_edit_reports],
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      reportGuid: "1234",
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("ReportDetailsForm", () => {
  it("renders view mode properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ReportDetailsForm
          initialValues={(mineReportSubmission as any) as IMineReportSubmission}
          isEditMode={false}
          mineGuid={"123"}
          formButtons={
            <div>
              <Button htmlType="submit">Submit</Button>
            </div>
          }
          handleSubmit={() => { }}
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
