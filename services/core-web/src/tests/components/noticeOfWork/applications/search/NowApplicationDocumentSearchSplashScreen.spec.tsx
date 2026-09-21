import React from "react";
import { render } from "@testing-library/react";
import NowApplicationDocumentSearchSplashScreen from "@/components/noticeOfWork/applications/search/NowApplicationDocumentSearchSplashScreen";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

describe("NowApplicationDocumentSearchSplashScreen", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <NowApplicationDocumentSearchSplashScreen onSearch={jest.fn()} loading={false} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders in loading state", () => {
    const { container } = render(
      <ReduxWrapper>
        <NowApplicationDocumentSearchSplashScreen onSearch={jest.fn()} loading={true} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
