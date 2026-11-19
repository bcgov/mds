import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "antd";
import { EditFinalPermitDocumentPackage } from "@/components/modalContent/EditFinalPermitDocumentPackage";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const SUBMISSION_GUIDS = ["sub-guid-1", "sub-guid-2"];

// The tables are replaced with buttons that drive the title and detail handlers the modal hands them
jest.mock("@/components/noticeOfWork/applications/NOWDocuments", () => () => null);
jest.mock("@/components/noticeOfWork/applications/NOWSubmissionDocuments", () => (props: any) => (
  <div>
    <span data-testid="highlight">{String(props.packageTitles?.highlightKey)}</span>
    <button
      type="button"
      onClick={() => props.packageTitles.onTitleChange("sub-guid-1", "First title")}
    >
      title-1
    </button>
    <button
      type="button"
      onClick={() => props.packageTitles.onTitleChange("sub-guid-2", "Second title")}
    >
      title-2
    </button>
    <button
      type="button"
      onClick={() => {
        props.packageTitles.onDetailChange("sub-guid-1", "author", "Pat");
        props.packageTitles.onDetailChange("sub-guid-1", "type", "FIGURE");
      }}
    >
      details-1
    </button>
  </div>
));

const submissionDoc = (guid: string) => ({
  mine_document_guid: guid,
  now_application_document_xref_guid: `${guid}-xref`,
  filename: `${guid}.pdf`,
  preamble_title: "",
});

const props = {
  onSubmit: jest.fn().mockResolvedValue(undefined),
  closeModal: jest.fn(),
  title: "mockTitle",
  documents: [],
  mineGuid: "",
  noticeOfWorkGuid: "",
  documentDownloadState: { downloading: false, currentFile: 1, totalFiles: 1 },
  noticeOfWork: {
    documents: [],
    filtered_submission_documents: SUBMISSION_GUIDS.map(submissionDoc),
  },
  finalDocuments: [],
  finalSubmissionDocuments: SUBMISSION_GUIDS,
};

const renderModal = () =>
  render(
    <ReduxWrapper
      initialState={{
        [NOTICE_OF_WORK]: { noticeOfWork: { now_application_guid: "now-guid" }, applicationDelays: [] },
      }}
    >
      <EditFinalPermitDocumentPackage {...props} />
    </ReduxWrapper>
  );

describe("EditFinalPermitDocumentPackage save validation", () => {
  beforeEach(() => {
    jest.spyOn(message, "error").mockImplementation(() => undefined as any);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    props.onSubmit.mockClear();
  });

  it("reports how many documents miss a title, highlights the first and doesn't save", async () => {
    renderModal();
    await userEvent.click(screen.getByText("Save Application Package"));

    expect(message.error).toHaveBeenCalledWith(expect.stringMatching(/^2 documents are missing a title/));
    expect(screen.getByTestId("highlight")).toHaveTextContent("sub-guid-1");
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("uses the singular once only one title is missing", async () => {
    renderModal();
    await userEvent.click(screen.getByText("title-1"));
    await userEvent.click(screen.getByText("Save Application Package"));

    expect(message.error).toHaveBeenCalledWith(expect.stringMatching(/^1 document is missing a title/));
    expect(screen.getByTestId("highlight")).toHaveTextContent("sub-guid-2");
  });

  it("saves the titles and details once every title is filled in", async () => {
    renderModal();
    await userEvent.click(screen.getByText("title-1"));
    await userEvent.click(screen.getByText("title-2"));
    await userEvent.click(screen.getByText("details-1"));
    await userEvent.click(screen.getByText("Save Application Package"));

    expect(message.error).not.toHaveBeenCalled();
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    const [, selectedSubmissionRows, options] = props.onSubmit.mock.calls[0];
    expect(selectedSubmissionRows).toEqual(SUBMISSION_GUIDS);
    expect(options.submissionTitles).toEqual({
      "sub-guid-1": "First title",
      "sub-guid-2": "Second title",
    });
    expect(options.submissionDetails["sub-guid-1"]).toEqual(
      expect.objectContaining({ author: "Pat", type: "FIGURE" })
    );
  });
});
