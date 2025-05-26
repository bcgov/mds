import React from "react";
import { render } from "@testing-library/react";
import WarningBanner from "@/components/common/WarningBanner";

const props = {
  type: "test",
};
const dispatchProps = {
  onClose: jest.fn(),
};

describe("WarningBanner", () => {
  it("renders properly", () => {
    const { container: component } = render(<WarningBanner {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
