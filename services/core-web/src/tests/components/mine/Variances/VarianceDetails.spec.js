import React from "react";
import { render } from "@testing-library/react";
import { VarianceDetails } from "@/components/mine/Variances/VarianceDetails";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  removeDocument: jest.fn(),
};
const props = {
  variance: MOCK.VARIANCES.records,
  complianceCodesHash: MOCK.HSRCM_HASH,
  mineName: "mockMineName",
  documentCategoryOptionsHash: MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_HASH,
  isViewOnly: false,
};

describe("VarianceDetails", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><VarianceDetails {...props} {...dispatchProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
