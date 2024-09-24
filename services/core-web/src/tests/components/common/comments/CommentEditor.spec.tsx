import React from "react";
import { CommentEditor } from "@mds/common/components/comments/CommentEditor";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("Comment", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <CommentEditor {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
