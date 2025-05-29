import React from "react";
import { CommentPanel } from "@/components/common/comments/CommentPanel";
import { render } from "@testing-library/react";
import { MINE_COMMENTS } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props: any = {
  location: { hash: "", pathname: "/dashboard" },
  children: "",
  loading: false,
  renderEditor: false,
  comments: MINE_COMMENTS.records,
  userRoles: [],
};
const dispatchProps: any = {
  onSubmit: jest.fn(),
  onChange: jest.fn(),
  onRemove: jest.fn(),
};

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
