import React from "react";
import { render } from "@testing-library/react";
import { NewMinespaceUser } from "@/components/admin/NewMinespaceUser";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  mines: MOCK.MINE_NAME_LIST.mines,
};
const dispatchProps = {
  fetchMineNameList: jest.fn(),
  fetchMinespaceUsers: jest.fn(),
  createMinespaceUser: jest.fn(() => Promise.resolve()),
};

describe("NewMinespaceUser", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <NewMinespaceUser {...props} {...dispatchProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
