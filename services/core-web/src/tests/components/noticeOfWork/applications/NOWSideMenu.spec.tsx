import React from "react";
import { render } from "@testing-library/react";
import { NOWSideMenu } from "@/components/noticeOfWork/applications/NOWSideMenu";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: {
      notice_of_work_type_code: "PLA",
      application_type_code: "NOW"
    }
  }
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: "1",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());


describe("NOWSideMenu", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <NOWSideMenu tabSection="application" />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
