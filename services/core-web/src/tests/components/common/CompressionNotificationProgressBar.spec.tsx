import React from "react";
import { render } from "@testing-library/react";
import { CompressionNotificationProgressBar } from "@mds/common/components/documents/CompressionNotificationProgressBar";

const props: any = {
  compressionProgress: 0,
  notificationTopPosition: 0,
};

describe("CompressionNotificationProgressBar", () => {
  it("renders properly", () => {
    const { container: component } = render(<CompressionNotificationProgressBar {...props} />);
    expect(component).toMatchSnapshot();
  });
});
