import React from "react";
import { shallow } from "enzyme";
import { ModalWrapper } from "@/components/common/wrappers/ModalWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
  dispatchProps.content = jest.fn();
  dispatchProps.clearOnSubmit = false;
};

const setupProps = () => {
  props.props = {
    title: "mockTitle",
  };
  props.isModalOpen = false;
  props.width = 520;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ModalWrapper", () => {
  it("renders properly", () => {
    const wrapper = shallow(<ModalWrapper {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
