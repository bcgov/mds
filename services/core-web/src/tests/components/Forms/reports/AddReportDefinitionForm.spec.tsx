import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";
import { BrowserRouter } from "react-router-dom";
import AddReportDefinitionForm from "@/components/admin/complianceCodes/AddReportDefinitionForm";
import { complianceReportReducerType } from "@mds/common/redux/slices/complianceReportsSlice";

const initialState = {
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_admin, USER_ROLES.role_edit_template_conditions],
  },
  [complianceReportReducerType]: {
    dueDateTypes: MOCK.MINE_REPORT_DUE_DATE_TYPES,
  },
};

describe("AddReportDefinitionForm", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <AddReportDefinitionForm handleSubmit={jest.fn()} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
