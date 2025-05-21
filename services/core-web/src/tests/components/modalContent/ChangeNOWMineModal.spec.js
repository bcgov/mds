import React from "react";
import { render } from "@testing-library/react";
import { ChangeNOWMineModal } from "@/components/modalContent/ChangeNOWMineModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.submit = jest.fn();
  dispatchProps.setMineGuid = jest.fn();
  dispatchProps.fetchMineNameList = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  // eslint-disable-next-line prefer-destructuring
  props.noticeOfWork = MOCK.NOW.applications[0];
  props.mineNameList = MOCK.MINE_NAME_LIST.mines;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ChangeNOWMineModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ChangeNOWMineModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
