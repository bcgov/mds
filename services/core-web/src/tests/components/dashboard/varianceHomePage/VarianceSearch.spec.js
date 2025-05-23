import React from "react";
import { render } from "@testing-library/react";
import VarianceSearch from "@/components/dashboard/varianceHomePage/VarianceSearch";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  handleVarianceSearch: jest.fn(),
};
const props = {
  initialValues: {},
  mineRegionOptions: MOCK.REGION_OPTIONS,
  complianceCodes: MOCK.COMPLIANCE_CODES,
};

describe("Variance Search Component", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <VarianceSearch {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
