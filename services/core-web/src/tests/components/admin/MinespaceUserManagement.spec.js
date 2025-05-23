import React from "react";
import { render } from "@testing-library/react";
import { MinespaceUserManagement } from "@/components/admin/MinespaceUserManagement";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  mines: MOCK.MINE_NAME_LIST,
  minespaceUsers: MOCK.MINESPACE_USER_LIST,
};
const dispatchProps = {
  fetchMineNameList: jest.fn(() => Promise.resolve()),
  fetchMinespaceUsers: jest.fn(() => Promise.resolve()),
  deleteMinespaceUser: jest.fn(() => Promise.resolve()),
  closeModal: jest.fn(),
  openModal: jest.fn(),
  createMinespaceUser: jest.fn(),
  updateMinespaceUserMines: jest.fn(),
  fetchMinespaceUserMines: jest.fn(),
};

describe("MinespaceUserManagement", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <MinespaceUserManagement {...props} {...dispatchProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
