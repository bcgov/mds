import React from "react";
import { render } from "@testing-library/react";
import { MajorMineApplicationFileUpload } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {
  onFileLoad: jest.fn(),
  onRemoveFile: jest.fn(),
  acceptedFileTypesMap: { key: "value" },
  projectGuid: "1234-asdc-0987",
  uploadType: "primary_document",
  label: "Upload primary application document",
  labelIdle: `<strong>Drag & Drop your files or <span class=\"filepond--label-action\">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>`,
  allowMultiple: true,
};

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
