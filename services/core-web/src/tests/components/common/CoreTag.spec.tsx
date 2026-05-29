import React from "react";
import { render } from "@testing-library/react";
import CoreTag from "@mds/common/components/common/CoreTag";
import CompanyIcon from "@mds/common/assets/icons/CompanyIcon";

describe("CoreTag", () => {
  it("renders properly", () => {
    const { container } = render(<CoreTag icon={<CompanyIcon />} text="test" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders a suffix when provided", () => {
    const { getByText } = render(
      <CoreTag icon={<CompanyIcon />} text="test" suffix={<span>extra content</span>} />
    );
    expect(getByText("extra content")).toBeInTheDocument();
  });
});
