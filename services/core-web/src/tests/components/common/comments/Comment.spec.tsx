import React from "react";
import { Comment } from "@/components/common/comments/Comment";
import { render } from "@testing-library/react";

const dispatchProps: any = {};
const props: any = {};

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
    const { container } = render(<Comment {...dispatchProps} {...props} />);
    expect(container).toMatchSnapshot();
  });
});
