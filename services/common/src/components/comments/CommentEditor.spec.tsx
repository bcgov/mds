import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import CommentEditor from "./CommentEditor";

describe("CommentEditor", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <CommentEditor
          onSubmit={() => {}}
          addCommentPermission={"core_edit_reports"}
          onChange={() => {}}
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
