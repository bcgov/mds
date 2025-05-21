import React from "react";
import { render } from "@testing-library/react";
import { MinespaceUserManagement } from "@/components/admin/MinespaceUserManagement";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mines = MOCK.MINE_NAME_LIST;
  props.minespaceUsers = MOCK.MINESPACE_USER_LIST;
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineNameList = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMinespaceUsers = jest.fn(() => Promise.resolve());
  dispatchProps.deleteMinespaceUser = jest.fn(() => Promise.resolve());
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.createMinespaceUser = jest.fn();
  dispatchProps.updateMinespaceUserMines = jest.fn();
  dispatchProps.fetchMinespaceUserMines = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MinespaceUserManagement", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MinespaceUserManagement {...props} {...dispatchProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
