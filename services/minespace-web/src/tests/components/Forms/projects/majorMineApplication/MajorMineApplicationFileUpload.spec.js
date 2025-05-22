import React from "react";
import { render } from "@testing-library/react";
import { MajorMineApplicationFileUpload } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.onFileLoad = jest.fn();
  props.onRemoveFile = jest.fn();
  props.acceptedFileTypesMap = { key: "value" };
  props.projectGuid = "1234-asdc-0987";
  props.uploadType = "primary_document";
  props.label = "Upload primary application document";
  props.labelIdle = `<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>`;
  props.allowMultiple = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MajorMineApplicationFileUpload", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <FormWrapper name="formName">
          <MajorMineApplicationFileUpload {...dispatchProps} {...props} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
