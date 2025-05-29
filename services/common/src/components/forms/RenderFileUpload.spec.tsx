import React from "react";
import { render } from "@testing-library/react";
import RenderFileUpload from "./RenderFileUpload";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PDF } from "@mds/common/constants/fileTypes";
import { Field } from "./form";
import FormWrapper from "./FormWrapper";

jest.mock("react-filepond", () => ({
  FilePond: class extends React.Component {
    render() {
      return <div data-testid="mock-filepond" />;
    }
  },
  registerPlugin: jest.fn(),
  supported: () => true,
}));

test("RenderFileUpload component renders correctly", () => {

  const { container: component } = render(
    <ReduxWrapper>
      <FormWrapper name="formName">
        <Field
          id="test-id"
          name="test-name"
          component={RenderFileUpload}
          uploadUrl="upload-url"
          acceptedFileTypesMap={PDF}
          onFileLoad={jest.fn()}
          onRemoveFile={jest.fn()}
          allowRevert
          allowMultiple={true}
          maxFiles={1}
          beforeAddFile={jest.fn()}
          beforeDropFile={jest.fn()}
          onUploadResponse={jest.fn()}
          maxFileSize="400MB"
          label="File Upload Label"
          labelHref="https://example.com"
        />
      </FormWrapper>
    </ReduxWrapper>
  );
  expect(component).toMatchSnapshot();
});
