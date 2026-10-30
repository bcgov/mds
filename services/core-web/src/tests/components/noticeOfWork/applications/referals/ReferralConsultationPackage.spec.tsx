import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { ReferralConsultationPackage } from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({ isFeatureEnabled: () => true }),
}));

jest.mock("@mds/common/redux/utils/actionlessNetworkCalls", () => ({
  downloadFileFromDocumentManager: jest.fn(),
}));

jest.mock("@/components/noticeOfWork/NOWActionWrapper", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  NOWActionWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockNoticeOfWork = {
  ...NOW_MOCK.NOTICE_OF_WORK,
  documents: [
    {
      now_application_document_xref_guid: "core-xref-1",
      mine_document: {
        mine_document_guid: "mine-doc-core-1",
        document_manager_guid: "docman-core-1",
      },
      is_referral_package: true,
      is_consultation_package: false,
    },
  ],
  filtered_submission_documents: [
    {
      mine_document_guid: "mine-doc-sub-1",
      document_manager_guid: "docman-sub-1",
      is_referral_package: false,
      is_consultation_package: true,
    },
  ],
};

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  setNoticeOfWorkApplicationDocumentDownloadState: jest.fn(),
  updateNoticeOfWorkApplication: jest.fn(() => Promise.resolve()),
  fetchImportedNoticeOfWorkApplication: jest.fn(() => Promise.resolve()),
  documentsCompression: jest.fn(),
  pollDocumentsCompressionProgress: jest.fn(),
  createNoticeOfWorkReferralPackage: jest.fn(() => Promise.resolve()),
  fetchNoticeOfWorkReferralPackages: jest.fn(() => Promise.resolve()),
};

const reducerProps = {
  noticeOfWork: mockNoticeOfWork,
  importNowSubmissionDocumentsJob: {},
  progress: "REV",
  type: "REF",
  isTableHeaderView: false,
};

describe("ReferralConsultationPackage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders properly", () => {
    const { container } = render(
      <ReferralConsultationPackage {...dispatchProps} {...reducerProps} />
    );
    expect(container).toMatchSnapshot();
  });

  it("renders table header view properly", () => {
    render(
      <BrowserRouter>
        <ReduxWrapper>
          <ReferralConsultationPackage
            {...dispatchProps}
            {...reducerProps}
            isTableHeaderView={true}
          />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("opens download package modal when clicked", () => {
    render(<ReferralConsultationPackage {...dispatchProps} {...reducerProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Referral Package" }));

    expect(dispatchProps.openModal).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          noticeOfWorkGuid: mockNoticeOfWork.now_application_guid,
          title: "Download Referral Package",
          type: "REF",
        }),
      })
    );
  });

  it("handles successful downloadDocumentPackage and creates referral package snapshot for REF", async () => {
    dispatchProps.documentsCompression.mockResolvedValue({
      data: { task_id: "task-123" },
    });
    dispatchProps.pollDocumentsCompressionProgress.mockResolvedValue({
      data: { state: "SUCCESS", success_docs: ["zip-guid-1"], error: [] },
    });

    render(<ReferralConsultationPackage {...dispatchProps} {...reducerProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Referral Package" }));

    const modalProps = dispatchProps.openModal.mock.calls[0][0].props;
    modalProps.onSubmit(["core-xref-1"], ["mine-doc-sub-1"]);

    await waitFor(() => {
      expect(dispatchProps.documentsCompression).toHaveBeenCalledWith(
        mockNoticeOfWork.mine_guid,
        ["docman-core-1", "docman-sub-1"]
      );
      expect(dispatchProps.createNoticeOfWorkReferralPackage).toHaveBeenCalledWith(
        mockNoticeOfWork.now_application_guid,
        { mine_document_guids: ["mine-doc-core-1", "mine-doc-sub-1"] }
      );
      expect(dispatchProps.fetchNoticeOfWorkReferralPackages).toHaveBeenCalledWith(
        mockNoticeOfWork.now_application_guid
      );
      expect(dispatchProps.closeModal).toHaveBeenCalled();
    });
  });

  it("does not create referral package snapshot on download if type is CON", async () => {
    dispatchProps.documentsCompression.mockResolvedValue({
      data: { task_id: "task-123" },
    });
    dispatchProps.pollDocumentsCompressionProgress.mockResolvedValue({
      data: { state: "SUCCESS", success_docs: ["zip-guid-1"], error: [] },
    });

    render(
      <ReferralConsultationPackage
        {...dispatchProps}
        {...reducerProps}
        type="CON"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Consultation Package" }));

    const modalProps = dispatchProps.openModal.mock.calls[0][0].props;
    modalProps.onSubmit(["core-xref-1"], ["mine-doc-sub-1"]);

    await waitFor(() => {
      expect(dispatchProps.documentsCompression).toHaveBeenCalled();
    });
    expect(dispatchProps.createNoticeOfWorkReferralPackage).not.toHaveBeenCalled();
  });

  it("does not create referral package if download is cancelled before completion", async () => {
    let resolvePoll: (value: any) => void = () => {};
    const pollPromise = new Promise((resolve) => {
      resolvePoll = resolve;
    });

    dispatchProps.documentsCompression.mockResolvedValue({
      data: { task_id: "task-123" },
    });
    dispatchProps.pollDocumentsCompressionProgress.mockReturnValue(pollPromise);

    render(<ReferralConsultationPackage {...dispatchProps} {...reducerProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Referral Package" }));

    const modalProps = dispatchProps.openModal.mock.calls[0][0].props;
    modalProps.onSubmit(["core-xref-1"], ["mine-doc-sub-1"]);

    await waitFor(() => {
      expect(dispatchProps.documentsCompression).toHaveBeenCalled();
    });

    // User cancels the download
    modalProps.cancelDownload();

    // Now polling completes
    resolvePoll({
      data: { state: "SUCCESS", success_docs: ["zip-guid-1"], error: [] },
    });

    await waitFor(() => {
      expect(dispatchProps.pollDocumentsCompressionProgress).toHaveBeenCalled();
    });
    expect(dispatchProps.createNoticeOfWorkReferralPackage).not.toHaveBeenCalled();
  });

  it("handles compression failure with error docs", async () => {
    dispatchProps.documentsCompression.mockResolvedValue({
      data: { task_id: "task-123" },
    });
    dispatchProps.pollDocumentsCompressionProgress.mockResolvedValue({
      data: { state: "SUCCESS", success_docs: [], error: ["doc-err"] },
    });

    render(<ReferralConsultationPackage {...dispatchProps} {...reducerProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Referral Package" }));

    const modalProps = dispatchProps.openModal.mock.calls[0][0].props;
    modalProps.onSubmit(["core-xref-1"], []);

    await waitFor(() => {
      expect(dispatchProps.pollDocumentsCompressionProgress).toHaveBeenCalled();
    });
    expect(dispatchProps.createNoticeOfWorkReferralPackage).not.toHaveBeenCalled();
  });

  it("handles handleSavePackage and creates referral package snapshot for REF", async () => {
    render(<ReferralConsultationPackage {...dispatchProps} {...reducerProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Referral Package" }));

    const modalProps = dispatchProps.openModal.mock.calls[0][0].props;
    await modalProps.handleSavePackage(["core-xref-1"], ["mine-doc-sub-1"]);

    expect(dispatchProps.updateNoticeOfWorkApplication).toHaveBeenCalled();
    expect(dispatchProps.createNoticeOfWorkReferralPackage).toHaveBeenCalledWith(
      mockNoticeOfWork.now_application_guid,
      { mine_document_guids: ["mine-doc-core-1", "mine-doc-sub-1"] }
    );
    expect(dispatchProps.fetchNoticeOfWorkReferralPackages).toHaveBeenCalledWith(
      mockNoticeOfWork.now_application_guid
    );
    expect(dispatchProps.fetchImportedNoticeOfWorkApplication).toHaveBeenCalledWith(
      mockNoticeOfWork.now_application_guid
    );
    expect(dispatchProps.closeModal).toHaveBeenCalled();
  });

  it("handles handleSavePackage for CON without creating referral package snapshot", async () => {
    render(
      <ReferralConsultationPackage
        {...dispatchProps}
        {...reducerProps}
        type="CON"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Consultation Package" }));

    const modalProps = dispatchProps.openModal.mock.calls[0][0].props;
    await modalProps.handleSavePackage(["core-xref-1"], []);

    expect(dispatchProps.updateNoticeOfWorkApplication).toHaveBeenCalled();
    expect(dispatchProps.createNoticeOfWorkReferralPackage).not.toHaveBeenCalled();
    expect(dispatchProps.fetchImportedNoticeOfWorkApplication).toHaveBeenCalled();
    expect(dispatchProps.closeModal).toHaveBeenCalled();
  });

  it("handles handleSavePackage when no files are selected", async () => {
    render(<ReferralConsultationPackage {...dispatchProps} {...reducerProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Referral Package" }));

    const modalProps = dispatchProps.openModal.mock.calls[0][0].props;
    await modalProps.handleSavePackage([], []);

    expect(dispatchProps.updateNoticeOfWorkApplication).toHaveBeenCalled();
    expect(dispatchProps.createNoticeOfWorkReferralPackage).not.toHaveBeenCalled();
    expect(dispatchProps.closeModal).toHaveBeenCalled();
  });

  it("still refreshes and closes the modal when the snapshot fails on save", async () => {
    dispatchProps.createNoticeOfWorkReferralPackage.mockRejectedValueOnce(new Error("fail"));
    render(<ReferralConsultationPackage {...dispatchProps} {...reducerProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Referral Package" }));

    const modalProps = dispatchProps.openModal.mock.calls[0][0].props;
    await modalProps.handleSavePackage(["core-xref-1"], ["mine-doc-sub-1"]);

    expect(dispatchProps.fetchNoticeOfWorkReferralPackages).not.toHaveBeenCalled();
    expect(dispatchProps.fetchImportedNoticeOfWorkApplication).toHaveBeenCalledWith(
      mockNoticeOfWork.now_application_guid
    );
    expect(dispatchProps.closeModal).toHaveBeenCalled();
  });

  it("does not throw when the snapshot fails after a successful download", async () => {
    dispatchProps.createNoticeOfWorkReferralPackage.mockRejectedValueOnce(new Error("fail"));
    dispatchProps.documentsCompression.mockResolvedValue({ data: { task_id: "task-123" } });
    dispatchProps.pollDocumentsCompressionProgress.mockResolvedValue({
      data: { state: "SUCCESS", success_docs: ["zip-guid-1"], error: [] },
    });

    render(<ReferralConsultationPackage {...dispatchProps} {...reducerProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Referral Package" }));

    const modalProps = dispatchProps.openModal.mock.calls[0][0].props;
    modalProps.onSubmit(["core-xref-1"], ["mine-doc-sub-1"]);

    await waitFor(() => {
      expect(dispatchProps.closeModal).toHaveBeenCalled();
    });
    expect(dispatchProps.createNoticeOfWorkReferralPackage).toHaveBeenCalled();
    expect(dispatchProps.fetchNoticeOfWorkReferralPackages).not.toHaveBeenCalled();
  });
});
