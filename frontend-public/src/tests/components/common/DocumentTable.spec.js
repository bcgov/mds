import React from "react";
import { shallow } from "enzyme";
import { DocumentTable } from "@/components/common/DocumentTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.isViewOnly = true;
  props.documents = MOCK.VARIANCE.documents;
};

const setupDispatchProps = () => {
  dispatchProps.removeDocument = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DocumentTable", () => {
  it("renders properly", () => {
    const component = shallow(<DocumentTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
