import React from "react";
import { shallow } from "enzyme";
import { DocumentCategoryForm } from "@/components/Forms/DocumentCategoryForm";

const props = {};

const setupProps = () => {
  props.documents = [];
  props.categories = [];
  props.isProcessed = false;
  props.mineGuid = "52783475";
  props.change = jest.fn();
  props.arrayPush = jest.fn();
  props.infoText = "some info";
};

beforeEach(() => {
  setupProps();
});

describe("DocumentCategoryForm", () => {
  it("renders properly", () => {
    const component = shallow(<DocumentCategoryForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
