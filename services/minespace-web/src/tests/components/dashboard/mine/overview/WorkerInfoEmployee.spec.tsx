import React from "react";
import { render } from "@testing-library/react";
import { WorkerInfoEmployee } from "@/components/dashboard/mine/overview/WorkerInfoEmployee";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
};
const dispatchProps = {
  fetchMineRecordById: jest.fn(() => Promise.resolve()),
  updateMineRecord: jest.fn(() => Promise.resolve()),
};

describe("WorkerInfoEmployee", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <WorkerInfoEmployee {...props} {...dispatchProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
