import React from "react";
import { render } from "@testing-library/react";
import { ViewVarianceModal } from "@/components/modalContent/ViewVarianceModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  closeModal: jest.fn(),
  type: "EXP",
  mineName: "Mock Mine",
  variance: MOCK.VARIANCES.records[0],
  inspectorsHash: MOCK.INSPECTORS_HASH,
  varianceStatusOptionsHash: MOCK.VARIANCE_STATUS_OPTIONS_HASH,
  varianceDocumentCategoryOptionsHash: MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_HASH,
  complianceCodesHash: {},
};

describe("ViewVarianceModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ViewVarianceModal {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
