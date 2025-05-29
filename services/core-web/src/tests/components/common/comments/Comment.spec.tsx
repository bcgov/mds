import React from "react";
import { Comment } from "@/components/common/comments/Comment";
import { render } from "@testing-library/react";

const props: any = {
  children: "",
  author: "mock name",
  datetime: "2021-08-07T00:00:00",
  actions: [],
};
const dispatchProps: any = {};

describe("Comment", () => {
  it("renders properly", () => {
    const { container } = render(<Comment {...dispatchProps} {...props} />);
    expect(container).toMatchSnapshot();
  });
});
