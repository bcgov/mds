import React from "react";
import { render } from "@testing-library/react";
import { AdminVerifiedMinesList } from "@/components/admin/AdminVerifiedMinesList";

const dispatchProps = {
  fetchMineVerifiedStatuses: jest.fn(() => Promise.resolve({ data: [] })),
};
const props = {
  location: { pathname: "" },
};

describe("AdminVerifiedMinesList", () => {
  it("renders properly", () => {
    const { container: component } = render(<AdminVerifiedMinesList {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
