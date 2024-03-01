import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ReportDetailsForm from "./ReportDetailsForm";
import { Button } from "antd";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { SystemFlagEnum, USER_ROLES } from "@mds/common/constants";

const mineReportSubmission = MOCK.MINE_REPORT_SUBMISSIONS[0];

const initialState = {
  reportSubmission: {
    reportSubmission: mineReportSubmission,
    mineReportGuid: mineReportSubmission.mine_report_guid,
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
  it("renders edit mode properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ReportDetailsForm
          isEditMode={true}
          mineGuid={"123"}
          formButtons={
            <div>
              <Button htmlType="submit">Submit</Button>
            </div>
          }
          handleSubmit={() => {}}
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
