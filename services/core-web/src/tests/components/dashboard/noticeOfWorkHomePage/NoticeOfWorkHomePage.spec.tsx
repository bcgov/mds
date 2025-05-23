import React from "react";
import { render } from "@testing-library/react";
import { NoticeOfWorkHomePage } from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkHomePage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { INoticeOfWork, IOption } from "@mds/common/interfaces";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  fetchNoticeOfWorkApplications: jest.fn(() => Promise.resolve({} as INoticeOfWork)),
  fetchRegionOptions: jest.fn(),
  fetchNoticeOfWorkApplicationStatusOptions: jest.fn(),
  fetchNoticeOfWorkApplicationTypeOptions: jest.fn(),
};

const NowApplications: INoticeOfWork[] = MOCK.NOW.applications;
const reducerProps = {
  noticeOfWorkApplications: NowApplications,
  pageData: MOCK.PAGE_DATA,
};

const requiredProps = {
  mineRegionHash: {},
  mineRegionOptions: [] as IOption[],
  applicationTypeOptions: [] as IOption[],
  applicationStatusOptions: [] as IOption[],
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useLocation: jest.fn().mockReturnValue({
      search: "mine_region=SW,NE",
    }),
    useHistory: jest.fn().mockReturnValue({
      replace: jest.fn(),
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("NoticeOfWorkHomePage", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper>
          {/* @ts-ignore: looks like the props definitions are wrong. */}
          <NoticeOfWorkHomePage {...dispatchProps} {...reducerProps} {...requiredProps} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
