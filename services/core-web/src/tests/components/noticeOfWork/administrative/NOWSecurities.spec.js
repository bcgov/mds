import React from "react";
import { render } from "@testing-library/react";
import { NOWSecurities } from "@/components/noticeOfWork/applications/administrative/NOWSecurities";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { IMPORTED_NOTICE_OF_WORK } from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

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

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}
describe("NOWSecurities", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper initialState={initialState}><NOWSecurities {...props} {...dispatchProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
