import React from "react";
import { shallow } from "enzyme";
import { VerificationTab } from "@/components/noticeOfWork/applications/verification/VerificationTab";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";
import * as MOCK from "@/tests/mocks/dataMocks";

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

describe("VerificationTab", () => {
  it("renders properly", () => {
    const component = shallow(<VerificationTab {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
