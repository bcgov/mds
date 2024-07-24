import React from "react";
import { render } from "@testing-library/react";
import CompanyIcon from "@mds/common/assets/icons/CompanyIcon";

describe("CompanyIcon", () => {
  it("renders properly", () => {
    const { container } = render(<CompanyIcon />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
