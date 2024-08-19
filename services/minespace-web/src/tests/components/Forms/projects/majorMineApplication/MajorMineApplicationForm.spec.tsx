import React from "react";
import { render, fireEvent } from "@testing-library/react";
import MajorMineApplicationForm from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { FORM } from "@mds/common";
import { reduxForm } from "redux-form";
import { ReduxWrapper as CommonReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { ReduxWrapper as MinespaceReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

import { useSelector } from "react-redux";

const mockDispatch = jest.fn();

jest.mock("react-redux", () => {
  const actualReactRedux = jest.requireActual("react-redux");
  return {
    ...actualReactRedux,
    useSelector: jest.fn(),
    useDispatch: () => mockDispatch,
  };
});

jest.mock(
  "@/components/Forms/projects/majorMineApplication/MajorMineApplicationFileUpload",
  () => (props: any) => (
    <div>
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            props.onFileLoad(
              e.target.files[0].name,
              "mock-document-manager-guid",
              "PRIMARY",
              FORM.ADD_MINE_MAJOR_APPLICATION
            );
          }
        }}
        onClick={() => {
          props.onRemoveFile(
            null,
            { serverId: "mock-document-manager-guid" },
            "primary_documents",
            [MOCK.PROJECTS.records[0].major_mine_application.documents[0]]
          );
        }}
      />
    </div>
  )
);

const initialState = {
  form: {
    ADD_MINE_MAJOR_APPLICATION: {
      values: {
        primary_documents: [MOCK.PROJECTS.records[0].major_mine_application.documents[0]],
        spatial_documents: [MOCK.PROJECTS.records[0].major_mine_application.documents[1]],
        supporting_documents: [MOCK.PROJECTS.records[0].major_mine_application.documents[2]],
      },
    },
  },
};

const props: any = {};
useSelector.mockReturnValue([MOCK.MINEDOCUMENTS.records[0]]);

beforeEach(() => {
  props.project = MOCK.PROJECTS.records[0];
  props.handleSubmit = jest.fn();
  props.refreshData = jest.fn();
});

const MajorMineApplicationReduxForm = reduxForm({
  form: FORM.ADD_MINE_MAJOR_APPLICATION,
})(MajorMineApplicationForm as any);

const WrappedMajorMineApplicationForm = () => (
  <BrowserRouter>
    <CommonReduxWrapper initialState={initialState}>
      <MinespaceReduxWrapper initialState={initialState}>
        <MajorMineApplicationReduxForm {...props} />
      </MinespaceReduxWrapper>
    </CommonReduxWrapper>
  </BrowserRouter>
);

describe("MajorMineApplicationForm", () => {
  it("renders properly", () => {
    const { container } = render(<WrappedMajorMineApplicationForm />);
    expect(container).toMatchSnapshot();
  });

  it("should invoke openSpatialDocumentModal when the 'Upload Spatial Data' button is clicked", () => {
    const { getByText } = render(<WrappedMajorMineApplicationForm />);
    const uploadSpatialButton = getByText("Upload Spatial Data");
    fireEvent.click(uploadSpatialButton);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should handle file upload for document", () => {
    const { container } = render(<WrappedMajorMineApplicationForm />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["file contents"], "example.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(fileInput.files.length).toBeGreaterThan(0);
  });

  it("should handle file removal for document", () => {
    const { container } = render(<WrappedMajorMineApplicationForm />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["file contents"], "example.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(fileInput);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
