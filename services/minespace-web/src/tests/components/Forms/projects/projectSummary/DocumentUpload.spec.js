import React from "react";
import { Provider } from "react-redux";
import { shallow } from "enzyme";
import { store } from "@/App";
import { DocumentUpload } from "@/components/Forms/projects/projectSummary/DocumentUpload";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn();
};

const setupProps = () => {
  props.initialValues = {};
  props.documents = {};
  props.isEditMode = true;
  props.projectSummaryDocumentTypesHash = {};
  props.mineGuid = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("DocumentUpload", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <DocumentUpload {...dispatchProps} {...props} />
      </Provider>
    );

    expect(component).toMatchSnapshot();
  });
});
