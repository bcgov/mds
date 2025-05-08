import React from "react";
import { render } from "@testing-library/react";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import NoticeOfWorkPage from "@/components/pages/NoticeOfWork/NoticeOfWorkPage";
import { ReduxWrapper as MSWrapper } from "@/tests/utils/ReduxWrapper";

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: MOCK.NOW.applications[0],
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      tab: "overview",
      nowApplicationGuid: "07e801a0-fa33-4c3b-abcc-ac6df628d483",
    }),
    useLocation: jest.fn().mockReturnValue({
      hash: "",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      location: { hash: "" },
    }),
    // isLoaded: jest.fn().mockReturnValue(true),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("NoticeOfWorkPage", () => {
  it("renders properly", () => {
    const { container } = render(
      <MSWrapper initialState={initialState}>
        <BrowserRouter>
          <NoticeOfWorkPage />
        </BrowserRouter>
      </MSWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
