import React from "react";
import { shallow } from "enzyme";
import { UploadedFilesList } from "@/components/common/UploadedFilesList";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.selectedDocGuid =
    MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_expected_documents[0].exp_document_guid;
  props.mineGuid = MOCK.MINES.mineIds[0];
  props.expectedDocumentStatusOptions = MOCK.EXPECTED_DOCUMENT_STATUS_OPTIONS.options;
  props.mines = MOCK.MINES.mines;
};

const setupDispatchProps = () => {
  dispatchProps.removeMineDocumentFromExpectedDocument = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("UploadedFilesList", () => {
  it("renders properly", () => {
    const wrapper = shallow(<UploadedFilesList {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
