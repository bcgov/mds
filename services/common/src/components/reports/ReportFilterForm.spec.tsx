import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ReportFilterForm from "./ReportFilterForm";
import * as Strings from "@mds/common/constants/strings";
import { FORM } from "@mds/common/constants/forms";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { SystemFlagEnum } from "@mds/common/constants/enums";

describe("ReportFilterForm", () => {
  const initialState = {
    form: {
      [FORM.FILTER_REPORTS]: {
        values: {},
      },
    },
    [AUTHENTICATION]: {
      systemFlag: SystemFlagEnum.core,
      userAccessData: [],
    },
  } as any;

  const defaultParams = {
    report_name: undefined,
    report_type: undefined,
    compliance_year: undefined,
    due_date_start: undefined,
    due_date_end: undefined,
    received_date_start: undefined,
    received_date_end: undefined,
    received_only: "false",
    requested_by: undefined,
    status: [],
    sort_field: "received_date",
    sort_dir: "desc",
    mine_reports_type: Strings.MINE_REPORTS_TYPE.codeRequiredReports,
  };

  it("renders with CORE code-required report type and matches snapshot", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ReportFilterForm
          onReset={jest.fn()}
          onSubmit={jest.fn()}
          initialValues={defaultParams}
          mineReportType={Strings.MINE_REPORTS_TYPE.codeRequiredReports}
        />
      </ReduxWrapper>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
