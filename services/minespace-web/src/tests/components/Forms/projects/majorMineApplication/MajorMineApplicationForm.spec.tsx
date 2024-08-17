import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import MajorMineApplicationForm from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import * as MOCK from "@/tests/mocks/dataMocks";

import * as FORM from "@/constants/forms";
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

const initialState = {
  form: {
    ADD_MINE_MAJOR_APPLICATION: {
      values: {
        primary_documents: [MOCK.PROJECT.major_mine_application.documents[0]],
        spatial_documents: [MOCK.PROJECT.major_mine_application.documents[1]],
        supporting_documents: [MOCK.PROJECT.major_mine_application.documents[2]],
      },
    },
  },
};

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    isFeatureEnabled: () => true,
  }),
}));

const props: any = {};
useSelector.mockReturnValue([
  {
    active_ind: "True",
    document_manager_guid: "4c7d88d6-e78d-48cf-a860-89b6a1e8903b",
    document_name: "05.4_Parent_Conduct.pdf",
    mine_document_guid: "11d15c31-5f0a-4a18-94de-e04e3ca7936f",
    mine_guid: "60300a07-376c-46f1-a984-88a813f91438",
  },
]);

beforeEach(() => {
  props.project = MOCK.PROJECT;
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
  it("renders properly when feature is enabled", () => {
    const { container } = render(<WrappedMajorMineApplicationForm />);
    expect(container).toMatchSnapshot();
  });

  it("should invoke openSpatialDocumentModal when the 'Upload Spatial Data' button is clicked", () => {
    const { getByText } = render(<WrappedMajorMineApplicationForm />);
    const uploadSpatialButton = getByText("Upload Spatial Data");
    fireEvent.click(uploadSpatialButton);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("should handle file upload for supporting documents", async () => {
    const { container } = render(<WrappedMajorMineApplicationForm />);
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(["file contents"], "example.pdf", { type: "application/pdf" });
    // Simulate file upload
    await fireEvent.change(fileInput, { target: { files: [file] } });

    // expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});
