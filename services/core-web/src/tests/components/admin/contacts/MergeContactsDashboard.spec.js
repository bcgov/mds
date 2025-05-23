import React from "react";
import { render } from "@testing-library/react";
import { MergeContactsDashboard } from "@/components/admin/contacts/MergeContactsDashboard";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  mergeParties: jest.fn(),
};
const props = {
  history: { replace: jest.fn() },
  location: { pathname: "" },
  match: { params: { tab: "" } },
};

describe("MergeContactDashboard", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper>
          <MergeContactsDashboard {...dispatchProps} {...props} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
