import React from "react";
import { render } from "@testing-library/react";
import { MinespaceUserList } from "@/components/admin/MinespaceUserList";
import { MINES, MINESPACE_USERS } from "@mds/common/tests/mocks/dataMocks";

describe("MinespaceUserList", () => {
  it("renders properly", () => {
    const minespaceUsers = MINESPACE_USERS;
    const minespaceUserMines = Object.values(MINES.mines);

    const { container: component } = render(
      <MinespaceUserList
        minespaceUsers={minespaceUsers}
        minespaceUserMines={minespaceUserMines}
        isLoaded
        handleDelete={jest.fn()}
        handleOpenModal={jest.fn()}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
