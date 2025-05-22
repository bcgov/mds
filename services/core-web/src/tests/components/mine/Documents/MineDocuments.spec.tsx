import React from "react";
import { render } from "@testing-library/react";
import { MineDocuments } from "@/components/mine/Documents/MineDocuments";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const setupProps = () => ({
  mines: MOCK.MINES.mines,
  mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
});

describe("MineDocuments", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MineDocuments {...setupProps()} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
