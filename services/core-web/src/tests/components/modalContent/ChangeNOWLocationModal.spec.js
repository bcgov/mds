import React from "react";
import { render } from "@testing-library/react";
import { ChangeNOWLocationModal } from "@/components/modalContent/ChangeNOWLocationModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve({}));
};

const setupProps = () => {
  props.title = "mockTitle";
  // eslint-disable-next-line prefer-destructuring
  props.noticeOfWork = MOCK.NOW.applications[0];
  // eslint-disable-next-line prefer-destructuring
  props.mineGuid = MOCK.MINES.mineIds[0];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

// Test suite failed to run

//     Jest worker encountered 4 child process exceptions, exceeding retry limit
describe.skip("ChangeNOWLocationModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ChangeNOWLocationModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
