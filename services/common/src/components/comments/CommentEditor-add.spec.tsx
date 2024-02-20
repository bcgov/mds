import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import CommentEditor from "./CommentEditor";

describe("CommentEditor", () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      userRoles: ["role_edit_incidents"],
    };
  });

  it("renders properly", () => {
    const { getByPlaceholderText } = render(
      <ReduxWrapper initialState={initialState}>
        <CommentEditor onSubmit={() => {}} />
      </ReduxWrapper>
    );
    const commentInput = getByPlaceholderText("Enter your comment here");
    expect(commentInput.firstChild).toMatchSnapshot();
  });
});
