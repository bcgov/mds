import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import CommentEditor from "@mds/common/components/comments/CommentEditor";
window.scrollTo = jest.fn();

describe("CommentEditor", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <CommentEditor onSubmit={() => {}} addCommentPermission={"core_edit_reports"} />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
