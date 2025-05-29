import React from "react";
import { CommentEditor } from "@mds/common/components/comments/CommentEditor";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props: any = {
  submitting: false,
};
const dispatchProps: any = {
  onSubmit: jest.fn(),
};

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
