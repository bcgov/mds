import React from "react";
import MajorProjectSearch from "@/components/dashboard/majorProjectHomePage/MajorProjectSearch";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  handleSearch: jest.fn(),
  handleReset: jest.fn(),
};
const props = {
  initialValues: {},
  statusCodes: MOCK.MAJOR_MINES_APPLICATION_STATUS_CODES_DROPDOWN,
};

describe("Major Project Search Component", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={{}}>
        <MajorProjectSearch {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
