import React from "react";
import { render } from "@testing-library/react";
import { AdminPermitConditionManagementOld } from "@/components/admin/permitConditions/AdminPermitConditionManagementOld";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {
  location: {
    pathname: "",
  },
};

describe("AdminPermitConditionManagementOld", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <AdminPermitConditionManagementOld {...dispatchProps} {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
