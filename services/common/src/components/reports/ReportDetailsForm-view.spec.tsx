import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ReportDetailsForm from "./ReportDetailsForm";
import { Button } from "antd";
import { AUTHENTICATION, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { IMineReportSubmission } from "../..";
import { SystemFlagEnum, USER_ROLES } from "@mds/common";

const mineReportSubmission = MOCK.MINE_REPORT_SUBMISSIONS[0];
const initialState = {
  reportSubmission: {
    reportSubmission: mineReportSubmission,
    mineReportGuid: mineReportSubmission.mine_report_guid,
  },
  [STATIC_CONTENT]: {
    mineReportDefinitionOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineReportDefinitionOptions,
  },
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [USER_ROLES.role_edit_reports],
  },
};

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
          handleSubmit={() => {}}
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
