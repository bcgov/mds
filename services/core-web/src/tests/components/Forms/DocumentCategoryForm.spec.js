import React from "react";
import { shallow } from "enzyme";
import { DocumentCategoryForm } from "@/components/Forms/DocumentCategoryForm";

const props = {};

const setupProps = () => {
  props.documents = [];
  props.categories = [];
  props.isApproved = false;
  props.mineGuid = "52783475";
  props.change = jest.fn();
  props.arrayPush = jest.fn();
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
