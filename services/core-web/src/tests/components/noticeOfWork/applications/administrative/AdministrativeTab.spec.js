import React from "react";
import { shallow } from "enzyme";
import { AdministrativeTab } from "@/components/noticeOfWork/applications/administrative/AdministrativeTab";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

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
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.inspectors = [];
  reducerProps.importNowSubmissionDocumentsJob = false;
  reducerProps.fixedTop = false;
  reducerProps.formValues = NOW_MOCK.NOTICE_OF_WORK;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("AdministrativeTab", () => {
  it("renders properly", () => {
    const component = shallow(<AdministrativeTab {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
