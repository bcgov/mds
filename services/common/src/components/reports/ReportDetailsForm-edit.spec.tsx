import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ReportDetailsForm from "./ReportDetailsForm";
import { Button } from "antd";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { REPORTS, AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { SystemFlagEnum } from "../..";

const mineReport = MOCK.MINE_REPORTS[0];

const initialState = {
  [REPORTS]: {
    reports: MOCK.MINE_REPORTS,
    mineReportGuid: mineReport.mine_report_guid,
    mineReports: [mineReport],
  },
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.ms,
  },
};

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
