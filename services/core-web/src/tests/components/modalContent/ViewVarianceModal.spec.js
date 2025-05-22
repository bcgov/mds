import React from "react";
import { render } from "@testing-library/react";
import { ViewVarianceModal } from "@/components/modalContent/ViewVarianceModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {};

const setupProps = () => {
  props.closeModal = jest.fn();
  props.type = "EXP";
  props.mineName = "Mock Mine";
  [props.variance] = MOCK.VARIANCES.records;
  props.inspectorsHash = MOCK.INSPECTORS_HASH;
  props.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
  props.varianceDocumentCategoryOptionsHash = MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_HASH;
  props.complianceCodesHash = {};
};

beforeEach(() => {
  setupProps();
});

describe("ViewVarianceModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ViewVarianceModal {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
