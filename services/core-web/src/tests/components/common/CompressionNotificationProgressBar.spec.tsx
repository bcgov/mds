import React from "react";
import { render } from "@testing-library/react";
import { CompressionNotificationProgressBar } from "@mds/common/components/documents/CompressionNotificationProgressBar";

const props: any = {};

const setupProps = () => {
  props.compressionProgress = 0;
  props.notificationTopPosition = 0;
};

beforeEach(() => {
  setupProps();
});

describe("CompressionNotificationProgressBar", () => {
  it("renders properly", () => {
    const { container: component } = render(<CompressionNotificationProgressBar {...props} />);
    expect(component).toMatchSnapshot();
  });
});
