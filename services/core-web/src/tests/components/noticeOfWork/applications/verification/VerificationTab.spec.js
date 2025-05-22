import React from "react";
import { shallow } from "enzyme";
import { VerificationTab } from "@/components/noticeOfWork/applications/verification/VerificationTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.importNoticeOfWorkApplication = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.originalNoticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  [reducerProps.mineGuid] = MOCK.MINES.mineIds;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

// if (name.length > 2) {
//                      ^

// TypeError: Cannot read properties of undefined (reading 'length')
//     at RenderMineSelect.handleChange (/workspaces/mds/services/core-web/src/components/common/RenderMineSelect.js:97:22)


describe("VerificationTab", () => {
  it("renders properly", () => {
    const component = shallow(<VerificationTab {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});