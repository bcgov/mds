import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditFinalPermitDocumentPackage } from "@/components/modalContent/EditFinalPermitDocumentPackage";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK, PERMITS } from "@mds/common/constants/reducerTypes";

// The real NOWDocuments/NOWSubmissionDocuments tables render through antd's Table with pagination
// and row-selection internals that are already covered by EditFinalPermitDocumentPackage.spec.tsx's
// snapshot test. Here we only care about EditFinalPermitDocumentPackage's own referenced-file warning
// logic, so both tables are replaced with a button that deselects every row, the same way unchecking
// every row in the real tables would.
jest.mock("@/components/noticeOfWork/applications/NOWDocuments", () => (props: any) => (
  <button type="button" onClick={() => props.selectedRows.setSelectedCoreRows([])}>
    mock-deselect-core-rows
  </button>
));

jest.mock("@/components/noticeOfWork/applications/NOWSubmissionDocuments", () => (props: any) => (
  <button type="button" onClick={() => props.selectedRows.setSelectedSubmissionRows([])}>
    mock-deselect-submission-rows
  </button>
));

const NOW_APPLICATION_GUID = "now-app-guid";
const CORE_FILE_GUID = "core-file-guid";
const SUBMISSION_MINE_DOC_GUID = "submission-mine-doc-guid";
const SUBMISSION_FILE_GUID = "submission-file-guid";

const stateWithCondition = (referencedGuid: string | null) => ({
  [NOTICE_OF_WORK]: {
    noticeOfWork: { now_application_guid: NOW_APPLICATION_GUID },
    applicationDelays: [],
  },
  [PERMITS]: {
    draftPermits: [
      {
        permit_amendments: [
          {
            now_application_guid: NOW_APPLICATION_GUID,
            permit_amendment_status_code: "DFT",
            conditions: referencedGuid
              ? [{ condition: `See {permit_package_file:${referencedGuid}}`, sub_conditions: [] }]
              : [{ condition: "No reference here.", sub_conditions: [] }],
          },
        ],
      },
    ],
  },
});

const baseProps = {
  onSubmit: jest.fn().mockResolvedValue(undefined),
  closeModal: jest.fn(),
  title: "mockTitle",
  documents: [],
  mineGuid: "",
  noticeOfWorkGuid: "",
  documentDownloadState: { downloading: false, currentFile: 1, totalFiles: 1 },
  noticeOfWork: {
    documents: [],
    filtered_submission_documents: [
      {
        mine_document_guid: SUBMISSION_MINE_DOC_GUID,
        now_application_document_xref_guid: SUBMISSION_FILE_GUID,
      },
    ],
  },
  finalDocuments: [CORE_FILE_GUID],
  finalSubmissionDocuments: [SUBMISSION_MINE_DOC_GUID],
};

const renderPackageEditor = (state: any) =>
  render(
    <ReduxWrapper initialState={state}>
      <EditFinalPermitDocumentPackage {...baseProps} />
    </ReduxWrapper>
  );

describe("EditFinalPermitDocumentPackage - remove-from-package reference warning", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("saves directly, with no warning, when a deselected core document isn't referenced anywhere", async () => {
    renderPackageEditor(stateWithCondition(null));
    await userEvent.click(screen.getByText("mock-deselect-core-rows"));
    await userEvent.click(screen.getByText("Save Application Package"));
    expect(baseProps.onSubmit).toHaveBeenCalledWith([], [SUBMISSION_MINE_DOC_GUID]);
  });

  it("warns before saving when a deselected core document is referenced in a condition", async () => {
    renderPackageEditor(stateWithCondition(CORE_FILE_GUID));
    await userEvent.click(screen.getByText("mock-deselect-core-rows"));
    await userEvent.click(screen.getByText("Save Application Package"));
    expect(
      screen.getByText(/This file is currently being referenced in a permit condition/i)
    ).toBeInTheDocument();
    expect(baseProps.onSubmit).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText("Yes"));
    expect(baseProps.onSubmit).toHaveBeenCalledWith([], [SUBMISSION_MINE_DOC_GUID]);
  });

  it("warns before saving when a deselected submission document is referenced in a condition", async () => {
    renderPackageEditor(stateWithCondition(SUBMISSION_FILE_GUID));
    await userEvent.click(screen.getByText("mock-deselect-submission-rows"));
    await userEvent.click(screen.getByText("Save Application Package"));
    expect(
      screen.getByText(/This file is currently being referenced in a permit condition/i)
    ).toBeInTheDocument();
    expect(baseProps.onSubmit).not.toHaveBeenCalled();
  });

  it("does not warn if the deselected submission document's own reference guid doesn't match", async () => {
    renderPackageEditor(stateWithCondition("some-other-guid"));
    await userEvent.click(screen.getByText("mock-deselect-submission-rows"));
    await userEvent.click(screen.getByText("Save Application Package"));
    expect(baseProps.onSubmit).toHaveBeenCalledWith([CORE_FILE_GUID], []);
  });
});
