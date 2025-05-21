import React from "react";
import { render } from "@testing-library/react";
import { DocumentCategoryForm } from "@/components/Forms/DocumentCategoryForm";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><DocumentCategoryForm {...props} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
