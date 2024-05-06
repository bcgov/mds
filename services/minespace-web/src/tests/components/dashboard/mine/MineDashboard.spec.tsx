import React from "react";
import { render } from "@testing-library/react";
import MineDashboard from "@/components/dashboard/mine/MineDashboard";
import * as MOCK from "@/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { MINES } from "@mds/common/constants/reducerTypes";

const initialState = {
  [MINES]: MOCK.MINES,
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: "18133c75-49ad-4101-85f3-a43e35ae989a",
      activeTab: "overview",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("MineDashboard", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <MineDashboard />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
