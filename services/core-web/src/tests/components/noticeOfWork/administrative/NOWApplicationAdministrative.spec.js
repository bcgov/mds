import React from "react";
import { shallow } from "enzyme";
import { NOWApplicationAdministrative } from "@/components/noticeOfWork/applications/administrative/NOWApplicationAdministrative";
import * as MOCK from "@/tests/mocks/dataMocks";
import { IMPORTED_NOTICE_OF_WORK } from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchPermits = jest.fn();
  dispatchProps.createNoticeOfWorkApplication = jest.fn(() => Promise.resolve());
  dispatchProps.handleSaveNOWEdit = jest.fn();
};

const setupReducerProps = () => {
  [reducerProps.mineGuid] = MOCK.MINES.mineIds;
  reducerProps.noticeOfWork = IMPORTED_NOTICE_OF_WORK;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NOWApplicationAdministrative", () => {
  it("renders properly", () => {
    const component = shallow(
      <NOWApplicationAdministrative {...reducerProps} {...dispatchProps} />
    );
    expect(component).toMatchSnapshot();
  });
});
