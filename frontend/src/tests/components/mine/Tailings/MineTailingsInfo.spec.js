import React from "react";
import { shallow } from "enzyme";
import { MineTailingsInfo } from "@/components/mine/Tailings/MineTailingsInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mines = MOCK.MINES.mines;
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.expectedDocumentStatusOptions = MOCK.EXPECTED_DOCUMENT_STATUS_OPTIONS.records;
  props.mineTSFRequiredReports = MOCK.MINE_TSF_REQUIRED_REPORTS;
};

const setupDispatchProps = () => {
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchExpectedDocumentStatusOptions = jest.fn();
  dispatchProps.fetchMineTailingsRequiredDocuments = jest.fn();
  dispatchProps.updateExpectedDocument = jest.fn();
  dispatchProps.removeExpectedDocument = jest.fn();
  dispatchProps.createMineExpectedDocument = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineTailingsInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineTailingsInfo {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
