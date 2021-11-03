import React from "react";
import { shallow } from "enzyme";
import { PermitPackage } from "@/components/noticeOfWork/applications/PermitPackage";
import * as NOWMocks from "@/tests/mocks/noticeOfWorkMocks";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.editPreambleFileMetadata = false;
  props.previousAmendmentDocuments = [];
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("PermitPackage", () => {
  it("renders properly", () => {
    const component = shallow(<PermitPackage {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
