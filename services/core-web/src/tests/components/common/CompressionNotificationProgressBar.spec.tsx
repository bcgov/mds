import React from "react";
import { shallow } from "enzyme";
import { CompressionNotificationProgressBar } from "@/components/common/CompressionNotificationProgressBar";

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
    const component = shallow(<CompressionNotificationProgressBar {...props} />);
    expect(component).toMatchSnapshot();
  });
});
