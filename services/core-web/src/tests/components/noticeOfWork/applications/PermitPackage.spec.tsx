import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { PermitPackage } from "@/components/noticeOfWork/applications/PermitPackage";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import * as documentActionCreator from "@mds/common/redux/actionCreators/documentActionCreator";
import * as noticeOfWorkActionCreator from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import * as modalActions from "@mds/common/redux/actions/modalActions";

// The wrapper hides actions based on permissions and progress, which isn't what these tests cover.
jest.mock("@/components/noticeOfWork/NOWActionWrapper", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

const dispatchProps = {};
const props = {
  isAdminView: true,
  isTableHeaderView: true,
  importNowSubmissionDocumentsJob: {},
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
};
describe("PermitPackage", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper initialState={initialState}><PermitPackage {...props} {...dispatchProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });

  describe("createFinalDocumentPackage", () => {
    const coreInPackage = {
      now_application_document_xref_guid: "core-in",
      is_final_package: false,
      preamble_title: "Old core title",
    };
    const coreRemoved = {
      now_application_document_xref_guid: "core-removed",
      is_final_package: true,
      preamble_title: "Kept core title",
    };
    const submissionInPackage = {
      mine_document_guid: "sub-in",
      is_final_package: false,
      preamble_title: null,
    };
    const submissionRemoved = {
      mine_document_guid: "sub-removed",
      is_final_package: true,
      preamble_title: "Kept submission title",
    };

    // Opens the modal through the real component and returns the onSubmit it hands to the modal.
    const createInstance = () => {
      const noticeOfWork = {
        now_application_guid: "now-guid",
        documents: [{ ...coreInPackage }, { ...coreRemoved }],
        filtered_submission_documents: [{ ...submissionInPackage }, { ...submissionRemoved }],
      };
      const updateSpy = jest
        .spyOn(noticeOfWorkActionCreator, "updateNoticeOfWorkApplication")
        .mockReturnValue((() => Promise.resolve({})) as any);
      jest
        .spyOn(noticeOfWorkActionCreator, "fetchImportedNoticeOfWorkApplication")
        .mockReturnValue((() => Promise.resolve({})) as any);
      const closeSpy = jest
        .spyOn(modalActions, "closeModal")
        .mockReturnValue({ type: "CLOSE_MODAL" } as any);
      const openSpy = jest
        .spyOn(modalActions, "openModal")
        .mockReturnValue({ type: "OPEN_MODAL_MOCK" } as any);

      render(
        <BrowserRouter>
          <ReduxWrapper
            initialState={{ [NOTICE_OF_WORK]: { noticeOfWork, applicationDelays: [] } }}
          >
            <PermitPackage {...props} {...dispatchProps} />
          </ReduxWrapper>
        </BrowserRouter>
      );
      fireEvent.click(screen.getByRole("button", { name: /Edit/ }));
      const { onSubmit } = openSpy.mock.calls[0][0].props;
      return { onSubmit, updateSpy, closeSpy };
    };

    afterEach(() => jest.restoreAllMocks());

    const findDocument = (payload, listName, guidField, guid) =>
      payload[listName].find((doc) => doc[guidField] === guid);

    it("saves the package selection with the titles for documents in the package", async () => {
      const { onSubmit, updateSpy } = createInstance();

      await onSubmit(["core-in"], ["sub-in"], {
        coreTitles: { "core-in": "  New core title  " },
        submissionTitles: { "sub-in": "New submission title" },
      });

      const [payload, guid] = updateSpy.mock.calls[0];
      expect(guid).toBe("now-guid");

      const savedCore = findDocument(payload, "documents", "now_application_document_xref_guid", "core-in");
      expect(savedCore.is_final_package).toBe(true);
      expect(savedCore.preamble_title).toBe("New core title");

      const savedSubmission = findDocument(
        payload,
        "submission_documents",
        "mine_document_guid",
        "sub-in"
      );
      expect(savedSubmission.is_final_package).toBe(true);
      expect(savedSubmission.preamble_title).toBe("New submission title");
    });

    it("keeps the saved title of documents removed from the package", async () => {
      const { onSubmit, updateSpy } = createInstance();

      await onSubmit(["core-in"], ["sub-in"], {
        coreTitles: { "core-in": "New core title", "core-removed": "Ignored" },
        submissionTitles: { "sub-in": "New submission title", "sub-removed": "Ignored" },
      });

      const [payload] = updateSpy.mock.calls[0];
      const removedCore = findDocument(
        payload,
        "documents",
        "now_application_document_xref_guid",
        "core-removed"
      );
      expect(removedCore.is_final_package).toBe(false);
      expect(removedCore.preamble_title).toBe("Kept core title");

      const removedSubmission = findDocument(
        payload,
        "submission_documents",
        "mine_document_guid",
        "sub-removed"
      );
      expect(removedSubmission.is_final_package).toBe(false);
      expect(removedSubmission.preamble_title).toBe("Kept submission title");
    });

    it("keeps the existing title of a package document the modal didn't track", async () => {
      const { onSubmit, updateSpy } = createInstance();

      await onSubmit(["core-in", "core-removed"], [], {
        coreTitles: { "core-in": "New core title" },
        submissionTitles: {},
      });

      const [payload] = updateSpy.mock.calls[0];
      const untracked = findDocument(
        payload,
        "documents",
        "now_application_document_xref_guid",
        "core-removed"
      );
      expect(untracked.is_final_package).toBe(true);
      expect(untracked.preamble_title).toBe("Kept core title");
    });

    it("still saves when called without titles", async () => {
      const { onSubmit, updateSpy, closeSpy } = createInstance();

      await onSubmit(["core-in"], []);

      const [payload] = updateSpy.mock.calls[0];
      const savedCore = findDocument(payload, "documents", "now_application_document_xref_guid", "core-in");
      expect(savedCore.is_final_package).toBe(true);
      expect(savedCore.preamble_title).toBe("Old core title");
      expect(closeSpy).toHaveBeenCalled();
    });

    it("sends copies and leaves the stored documents unchanged", async () => {
      const { onSubmit, updateSpy } = createInstance();

      await onSubmit(["core-in"], ["sub-in"], {
        coreTitles: { "core-in": "New core title" },
        coreDetails: { "core-in": { type: "FIGURE", author: "Jane", date: "2026-01-15" } },
      });

      const [payload] = updateSpy.mock.calls[0];
      expect(coreInPackage.is_final_package).toBe(false);
      expect(coreInPackage.preamble_title).toBe("Old core title");
      expect(submissionInPackage.is_final_package).toBe(false);
      expect(payload.filtered_submission_documents).toBe(payload.submission_documents);
      const savedCore = findDocument(payload, "documents", "now_application_document_xref_guid", "core-in");
      expect(savedCore.permit_package_document_type_code).toBe("FIGURE");
      expect(savedCore.preamble_author).toBe("Jane");
    });
  });

  describe("Download All", () => {
    const noticeOfWork = {
      ...NOWMocks.IMPORTED_NOTICE_OF_WORK,
      filtered_submission_documents: [],
      documents: [
        {
          now_application_document_xref_guid: "package-xref",
          is_final_package: true,
          mine_document: {
            mine_document_guid: "package-mine-doc",
            document_manager_guid: "package-doc-manager",
            document_name: "package.pdf",
          },
        },
      ],
    };

    const clickDownloadAll = (showDownloadWarning?: boolean) => {
      render(
        <BrowserRouter>
          <ReduxWrapper
            initialState={{ [NOTICE_OF_WORK]: { noticeOfWork, applicationDelays: [] } }}
          >
            <PermitPackage
              {...props}
              {...dispatchProps}
              isTableHeaderView={false}
              showDownloadWarning={showDownloadWarning}
            />
          </ReduxWrapper>
        </BrowserRouter>
      );
      fireEvent.click(screen.getByRole("button", { name: /Download All/ }));
    };

    let compressionSpy: jest.SpyInstance;
    beforeEach(() => {
      compressionSpy = jest
        .spyOn(documentActionCreator, "documentsCompression")
        .mockReturnValue(() => Promise.resolve({ data: {} }));
    });

    afterEach(() => {
      compressionSpy.mockRestore();
    });

    it("warns that previous versions aren't included when showDownloadWarning is set", async () => {
      clickDownloadAll(true);

      expect(await screen.findByText(/previous versions will not be downloaded/)).toBeInTheDocument();
      expect(compressionSpy).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Continue" }));

      expect(compressionSpy).toHaveBeenCalledWith(noticeOfWork.mine_guid, ["package-doc-manager"]);
    });

    it("downloads straight away by default, as before", () => {
      clickDownloadAll();

      expect(screen.queryByText(/previous versions will not be downloaded/)).not.toBeInTheDocument();
      expect(compressionSpy).toHaveBeenCalledWith(noticeOfWork.mine_guid, ["package-doc-manager"]);
    });
  });
});
