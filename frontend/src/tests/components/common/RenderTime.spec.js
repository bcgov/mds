import React from "react";
import { shallow } from "enzyme";
import moment from "moment";
import RenderTime from "@/components/common/RenderTime";

let props = {};

const setupProps = () => {
  const time = moment("2019-08-27T07:00:00.000Z");
  props = {
    id: 1,
    input: { value: time },
    label: "Time",
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
    defaultOpenValue: time,
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderTime", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RenderTime {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
