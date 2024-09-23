import React from "react";
import { CommentPanel } from "@/components/common/comments/CommentPanel";
import { render } from "@testing-library/react";
import { MINE_COMMENTS } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.onChange = jest.fn();
  dispatchProps.onRemove = jest.fn();
};

const setupProps = () => {
  props.location = { hash: "", pathname: "/dashboard" };
  props.children = "";

  props.loading = false;
  props.renderEditor = false;
  props.comments = MINE_COMMENTS.records;
  props.userRoles = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("Comment", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <CommentPanel {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
