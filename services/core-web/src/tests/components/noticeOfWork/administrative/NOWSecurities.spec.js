import React from "react";
import { shallow } from "enzyme";
import { NOWSecurities } from "@/components/noticeOfWork/applications/administrative/NOWSecurities";
import * as MOCK from "@/tests/mocks/dataMocks";
import { IMPORTED_NOTICE_OF_WORK } from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.updatePermitAmendment = jest.fn();
  dispatchProps.fetchDraftPermitByNOW = jest.fn(() => Promise.resolve());
  dispatchProps.handleSaveNOWEdit = jest.fn();
};

const setupProps = () => {
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.noticeOfWork = IMPORTED_NOTICE_OF_WORK;
  [props.draftPermits] = MOCK.PERMITS;
  [props.draftAmendment] = MOCK.PERMITS[0].permit_amendments;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("NOWSecurities", () => {
  it("renders properly", () => {
    const component = shallow(<NOWSecurities {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
