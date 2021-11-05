import React from "react";
import { shallow } from "enzyme";
import { ViewVarianceModal } from "@/components/modalContent/ViewVarianceModal";
import * as MOCK from "@/tests/mocks/dataMocks";

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
    const component = shallow(<ViewVarianceModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
