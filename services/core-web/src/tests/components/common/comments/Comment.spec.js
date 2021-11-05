import React from "react";
import { shallow } from "enzyme";
import { Comment } from "@/components/common/comments/Comment";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.children = "";
  props.author = "mock name";
  props.datetime = "2021-08-07T00:00:00";
  props.actions = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("Comment", () => {
  it("renders properly", () => {
    const wrapper = shallow(<Comment {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
