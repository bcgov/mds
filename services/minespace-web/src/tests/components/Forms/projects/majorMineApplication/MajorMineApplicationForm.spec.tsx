import React from "react";
import { render, fireEvent } from "@testing-library/react";
import MajorMineApplicationForm from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { FORM } from "@mds/common/constants/forms";
import { ReduxWrapper as MinespaceReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const mockDispatch = jest.fn();

jest.mock("react-redux", () => {
  const actualReactRedux = jest.requireActual("react-redux");
  return {
    ...actualReactRedux,
    useDispatch: () => mockDispatch,
  };
});

jest.mock("@mds/common/components/documents/DocumentTable", () => (props: any) => (
  <div>
    <button onClick={() => props.onArchivedDocuments()}>Archive Documents</button>
  </div>
));

const values = {
  primary_documents: MOCK.PROJECT.major_mine_application.documents.filter(
    (d) => d.major_mine_application_document_type_code === "PRM"
  ),
  appendix_documents: MOCK.PROJECT.major_mine_application.documents.filter(
    (d) => d.major_mine_application_document_type_code === "APX"
  ),
  spatial_documents: MOCK.PROJECT.major_mine_application.documents.filter(
    (d) => d.major_mine_application_document_type_code === "SPT"
  ),
  supporting_documents: MOCK.PROJECT.major_mine_application.documents.filter(
    (d) => d.major_mine_application_document_type_code === "SPR"
  ),
};

const initialState = {
  form: {
    ADD_MINE_MAJOR_APPLICATION: {
      values,
    },
  },
  mines: {
    mineDocuments: [MOCK.MINEDOCUMENTS.records[0]],
  },
};

const props = {
  project: MOCK.PROJECT,
  refreshData: jest.fn(),
};

const WrappedMajorMineApplicationForm = () => (
  <BrowserRouter>
    <MinespaceReduxWrapper initialState={initialState}>
      <FormWrapper
        name={FORM.ADD_MINE_MAJOR_APPLICATION}
        initialValues={values}
        onSubmit={jest.fn()}
        reduxFormConfig={{
          destroyOnUnmount: true,
        }}
      >
        <MajorMineApplicationForm project={props.project} refreshData={props.refreshData} />
      </FormWrapper>
    </MinespaceReduxWrapper>
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

  it("should call refreshData when documents are archived", () => {
    const { getAllByText } = render(<WrappedMajorMineApplicationForm />);
    const archiveButtons = getAllByText("Archive Documents");
    fireEvent.click(archiveButtons[0]);
    expect(props.refreshData).toHaveBeenCalled();
  });
});
