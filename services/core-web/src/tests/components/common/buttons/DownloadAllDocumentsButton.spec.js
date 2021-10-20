import React from "react";
import { shallow } from "enzyme";
import { DownloadAllDocumentsButton } from "@/components/common/buttons/DownloadAllDocumentsButton";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.documents = [];
};

const setupDispatchProps = () => {};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DownloadAllDocumentsButton", () => {
  it("renders properly", () => {
    const wrapper = shallow(<DownloadAllDocumentsButton {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
