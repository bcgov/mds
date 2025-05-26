import React from "react";
import { render } from "@testing-library/react";
import { NoticeOfWorkSearch } from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkSearch";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  handleSearch: jest.fn(),
  initialValues: {},
};

describe("NoticeOfWorkSearch", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <NoticeOfWorkSearch {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
