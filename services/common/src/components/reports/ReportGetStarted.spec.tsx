import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { Button } from "antd";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { AUTHENTICATION, MINES, PERMITS } from "@mds/common/constants/reducerTypes";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { USER_ROLES } from "@mds/common/constants/environment";
import { IMineReportSubmission, IPermitAmendment } from "@mds/common/interfaces";
import { FORM } from "@mds/common/constants/forms";
import ReportGetStarted from "./ReportGetStarted";
import FormWrapper from "../forms/FormWrapper";
import { RenderPRRFields } from "./PermitRequiredReportFields";

const CRRMineReportSubmission = MOCK.MINE_REPORT_SUBMISSIONS[0];
const PRRMineReportSubmission = MOCK.MINE_REPORT_SUBMISSIONS[1];
const verifiedPRRMineReportSubmission = MOCK.MINE_REPORT_SUBMISSIONS[2];
const mockMine = MOCK.MINES.mines[MOCK.MINES.mineIds[3]];

const initialState = (
  mineReportSubmission: IMineReportSubmission,
  permitGuid: string,
  permitAmendment: IPermitAmendment
) => ({
  [MINES]: MOCK.MINES,
  [PERMITS]: {
    permits: MOCK.PERMITS,
    permitAmendments: { [permitGuid]: permitAmendment },
    latestPermitAmendments: {
      [permitGuid]: permitAmendment,
    },
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

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({
    reportGuid: "1234",
  }),
}));

describe("ReportGetStarted", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders default", () => {
    const { container } = render(
      <ReduxWrapper
        initialState={initialState(
          CRRMineReportSubmission,
          MOCK.PERMITS[0].permit_guid,
          MOCK.PERMITS[0].permit_amendments[0]
        )}
      >
        <ReportGetStarted
          mine={mockMine}
          formButtons={
            <div>
              <Button htmlType="submit">Submit</Button>
            </div>
          }
          handleSubmit={() => {}}
          setDisableNextButton={() => {}}
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders create PRR properly", () => {
    const { container } = render(
      <ReduxWrapper
        initialState={initialState(
          PRRMineReportSubmission,
          MOCK.PERMITS[0].permit_guid,
          MOCK.PERMITS[0].permit_amendments[0]
        )}
      >
        <FormWrapper
          name={FORM.VIEW_EDIT_REPORT}
          initialValues={PRRMineReportSubmission}
          onSubmit={() => {}}
        >
          <RenderPRRFields mineGuid={mockMine.mine_guid}></RenderPRRFields>
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders create verified PRR properly", () => {
    const { container } = render(
      <ReduxWrapper
        initialState={initialState(
          verifiedPRRMineReportSubmission,
          MOCK.PERMITS[2].permit_guid,
          MOCK.PERMITS[2].permit_amendments[0]
        )}
      >
        <FormWrapper
          name={FORM.VIEW_EDIT_REPORT}
          initialValues={verifiedPRRMineReportSubmission}
          onSubmit={() => {}}
        >
          <RenderPRRFields mineGuid={mockMine.mine_guid}></RenderPRRFields>
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
