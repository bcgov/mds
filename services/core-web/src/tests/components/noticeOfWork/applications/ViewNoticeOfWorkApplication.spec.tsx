import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import { ViewNoticeOfWorkApplication } from "@/components/noticeOfWork/applications/ViewNoticeOfWorkApplication";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {
  renderTabTitle: jest.fn(),
};
const reducerProps = {
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  applicationPageFromRoute: "mock/url",
  fixedTop: false,
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
    originalNoticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
    applicationDelays: [],
  }
}
// TypeError: Cannot read properties of undefined (reading 'party_guid')
describe.skip("ViewNoticeOfWorkApplication", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <ViewNoticeOfWorkApplication
            {...dispatchProps}
            {...reducerProps}
            match={{ params: { id: 1, tab: "application" } }}
          />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});

describe("ViewNoticeOfWorkApplication", () => {
  it("renders properly", () => {
    const wrapper = shallow(
      <ViewNoticeOfWorkApplication
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1, tab: "application" } }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
