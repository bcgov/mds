import React from "react";
import { render } from "@testing-library/react";
import { AdministrativeTab } from "@/components/noticeOfWork/applications/administrative/AdministrativeTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationContextTemplate = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.generateNoticeOfWorkApplicationDocument = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWork = NOW_MOCK.IMPORTED_NOTICE_OF_WORK;
  reducerProps.inspectors = [];
  reducerProps.importNowSubmissionDocumentsJob = false;
  reducerProps.fixedTop = false;
  reducerProps.formValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}

describe("AdministrativeTab", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper initialState={initialState}><BrowserRouter><AdministrativeTab {...dispatchProps} {...reducerProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
