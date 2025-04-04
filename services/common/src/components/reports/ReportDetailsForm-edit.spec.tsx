import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ReportDetailsForm from "./ReportDetailsForm";
import { Button } from "antd";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { AUTHENTICATION, MINES, PERMITS } from "@mds/common/constants/reducerTypes";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { USER_ROLES } from "@mds/common/constants/environment";
import { IMineReportSubmission } from "@mds/common/interfaces";
import { FORM } from "@mds/common/constants/forms";

const CRRMineReportSubmission = MOCK.MINE_REPORT_SUBMISSIONS[0];
const PRRMineReportSubmission = MOCK.MINE_REPORT_SUBMISSIONS[1];
const verifiedPRRMineReportSubmission = MOCK.MINE_REPORT_SUBMISSIONS[2];

const initialState = (mineReportSubmission: IMineReportSubmission) => ({
  [MINES]: MOCK.MINES,
  [PERMITS]: {
    permits: MOCK.PERMITS,
    permitAmendments: { [MOCK.PERMITS[2].permit_guid]: MOCK.PERMITS[2].permit_amendments[0] },
    latestPermitAmendments: { [MOCK.PERMITS[2].permit_guid]: MOCK.PERMITS[2].permit_amendments[0] },
  },
  form: {
    [FORM.VIEW_EDIT_REPORT]: {
      values: mineReportSubmission,
    },
  },
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [USER_ROLES.role_edit_reports],
  },
});

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
  it("renders CRR edit mode properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState(CRRMineReportSubmission)}>
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

  it("renders PRR edit mode properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState(PRRMineReportSubmission)}>
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

  it("renders verified PRR edit mode properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState(verifiedPRRMineReportSubmission)}>
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
