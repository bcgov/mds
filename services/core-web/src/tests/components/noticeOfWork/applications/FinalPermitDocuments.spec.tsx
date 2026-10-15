import React from "react";
import { render } from "@testing-library/react";
import { FinalPermitDocuments, getNowApplicationDocument } from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { IMPORTED_NOTICE_OF_WORK } from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {
  setNoticeOfWorkApplicationDocumentDownloadState: jest.fn(),
  updateNoticeOfWorkApplication: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  closeModal: jest.fn(),
  openModal: jest.fn(),
};

const baseProps = {
  documents: [],
  mineGuid: MOCK.MINES.mineIds[0],
  noticeOfWork: IMPORTED_NOTICE_OF_WORK,
  documentDownloadState: { downloading: false, currentFile: 1, totalFiles: 1 },
  progress: {},
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  },
};

const makeNtrDoc = (overrides = {}) => ({
  now_application_document_type_code: "NTR",
  now_application_document_xref_guid: "ntr-xref-guid-1",
  is_system_generated: true,
  is_final_package: true,
  deleted_ind: false,
  description: "This document was automatically created when Technical Review was completed.",
  preamble_title: "Notice of Work Application",
  preamble_author: "N/A",
  preamble_date: "2025-01-15",
  create_timestamp: "2025-01-15T10:00:00",
  mine_document: {
    mine_document_guid: "mine-doc-guid-1",
    document_manager_guid: "doc-mgr-guid-1",
    document_name: "now-form.pdf",
    upload_date: "2025-01-15",
  },
  ...overrides,
});

const renderComponent = (props: Record<string, unknown> = {}) =>
  render(
    <BrowserRouter>
      <ReduxWrapper initialState={initialState}>
        <FinalPermitDocuments {...dispatchProps} {...baseProps} {...props} />
      </ReduxWrapper>
    </BrowserRouter>
  );

describe("FinalPermitDocuments", () => {
  it("renders properly", () => {
    const { container: component } = renderComponent();
    expect(component).toMatchSnapshot();
  });

  describe("getNowApplicationDocument", () => {
    it("returns null for non-NOW application types", () => {
      const result = getNowApplicationDocument(
        { ...IMPORTED_NOTICE_OF_WORK, application_type_code: "AIA", documents: [] },
        {}
      );
      expect(result.nowApplicationDocument).toBeNull();
    });

    it("returns null when no system-generated NTR exists", () => {
      const result = getNowApplicationDocument(
        {
          ...IMPORTED_NOTICE_OF_WORK,
          documents: [
            { now_application_document_type_code: "OTH", is_system_generated: false, is_final_package: true },
          ],
        },
        {}
      );
      expect(result.nowApplicationDocument).toBeNull();
    });

    it("returns null when technical review has not been completed", () => {
      const result = getNowApplicationDocument(
        {
          ...IMPORTED_NOTICE_OF_WORK,
          documents: [makeNtrDoc({ is_final_package: false, description: "Some other description" })],
        },
        {}
      );
      expect(result.nowApplicationDocument).toBeNull();
    });

    it("returns the NA row when tech review is done but no qualifying NTR is in the package", () => {
      const result = getNowApplicationDocument(
        {
          ...IMPORTED_NOTICE_OF_WORK,
          documents: [makeNtrDoc({ is_final_package: false })],
        },
        { REV: { end_date: "2025-01-01" } }
      );
      expect(result.nowApplicationDocument).not.toBeNull();
      expect(result.nowApplicationDocument.isLockedApplicationForm).toBe(true);
      expect(result.nowApplicationDocument.preamble_title).toBe("N/A");
      expect(result.lockedNtrGuid).toBeNull();
    });

    it("returns the locked row when tech review is done via progress.REV.end_date", () => {
      const ntrDoc = makeNtrDoc();
      const result = getNowApplicationDocument(
        { ...IMPORTED_NOTICE_OF_WORK, documents: [ntrDoc], locked_ntr_guid: "ntr-xref-guid-1" },
        { REV: { end_date: "2025-01-01" } }
      );
      expect(result.nowApplicationDocument).not.toBeNull();
      expect(result.nowApplicationDocument.isLockedApplicationForm).toBe(true);
      expect(result.nowApplicationDocument.category).toBe("Notice of Work Form");
      expect(result.lockedNtrGuid).toBe("ntr-xref-guid-1");
    });

    it("returns the locked row when tech review is done via the NTR description sentinel", () => {
      const ntrDoc = makeNtrDoc();
      const result = getNowApplicationDocument(
        { ...IMPORTED_NOTICE_OF_WORK, documents: [ntrDoc], locked_ntr_guid: "ntr-xref-guid-1" },
        {}
      );
      expect(result.nowApplicationDocument).not.toBeNull();
      expect(result.lockedNtrGuid).toBe("ntr-xref-guid-1");
    });

    it("uses the server-computed locked_ntr_guid to pick the right doc when multiple NTRs qualify", () => {
      const olderNtr = makeNtrDoc({
        now_application_document_xref_guid: "ntr-xref-old",
        create_timestamp: "2024-06-01T08:00:00",
      });
      const newerNtr = makeNtrDoc({
        now_application_document_xref_guid: "ntr-xref-new",
        create_timestamp: "2025-01-15T14:30:00",
      });
      const result = getNowApplicationDocument(
        {
          ...IMPORTED_NOTICE_OF_WORK,
          documents: [olderNtr, newerNtr],
          locked_ntr_guid: "ntr-xref-new",
        },
        { REV: { end_date: "2025-01-01" } }
      );

      expect(result.lockedNtrGuid).toBe("ntr-xref-new");
      expect(result.nowApplicationDocument.now_application_document_xref_guid).toBe("ntr-xref-new");
    });
  });

  describe("permit package figures and documents table", () => {
    const finalPackageDocument = {
      now_application_document_xref_guid: "final-doc-1",
      final_package_order: 1,
      is_final_package: true,
      is_referral_package: false,
      is_consultation_package: false,
      permit_package_document_type_code: "DOCUMENT",
      description: "A final package document",
      now_application_document_type_code: "OTH",
      mine_document: {
        mine_document_guid: "mine-doc-1",
        document_manager_guid: "doc-mgr-1",
        document_name: "final-doc.pdf",
        upload_date: "2025-01-15",
      },
    };

    const renderUnified = (overrides: Record<string, unknown> = {}) =>
      render(
        <BrowserRouter>
          <ReduxWrapper initialState={initialState}>
            <FinalPermitDocuments
              {...dispatchProps}
              {...baseProps}
              noticeOfWork={{ ...IMPORTED_NOTICE_OF_WORK, documents: [finalPackageDocument] }}
              showInUnifiedView
              isFeatureEnabled={() => true}
              adminView={false}
              progress={{ DFT: { start_date: "2025-01-01" } }}
              userCanEditPermits
              {...overrides}
            />
          </ReduxWrapper>
        </BrowserRouter>
      );

    it("splits into separate Figure and Document tables when every split condition is met", () => {
      const { container } = renderUnified();
      expect(container.querySelectorAll(".ant-table")).toHaveLength(2);
    });

    it("keeps a single combined table when the type-selector feature flag is off", () => {
      const { container } = renderUnified({ isFeatureEnabled: () => false });
      expect(container.querySelectorAll(".ant-table")).toHaveLength(1);
    });

    it("keeps a single combined table in admin view", () => {
      const { container } = renderUnified({ adminView: true });
      expect(container.querySelectorAll(".ant-table")).toHaveLength(1);
    });

    it("keeps a single combined table before the draft has started", () => {
      const { container } = renderUnified({ progress: {} });
      expect(container.querySelectorAll(".ant-table")).toHaveLength(1);
    });

    it("keeps a single combined table once the application is in a decided/complete status", () => {
      const { container } = renderUnified({
        noticeOfWork: {
          ...IMPORTED_NOTICE_OF_WORK,
          documents: [finalPackageDocument],
          now_application_status_code: "AIA",
        },
      });
      expect(container.querySelectorAll(".ant-table")).toHaveLength(1);
    });

    it("shows the Order column once the draft has started, even before it's in progress", () => {
      const { getByText } = renderUnified({
        isFeatureEnabled: () => false,
        progress: { DFT: { start_date: "2025-01-01", end_date: "2025-02-01" } },
      });
      expect(getByText("Order")).toBeInTheDocument();
    });

    it("allows dragging when not admin view, the draft is in progress, and the user can edit permits", () => {
      const { container } = renderUnified({ isFeatureEnabled: () => false });
      expect(container.querySelector(".anticon-menu")).not.toBeNull();
    });

    it("disallows dragging when the user cannot edit permits, even while the draft is in progress", () => {
      const { container } = renderUnified({
        isFeatureEnabled: () => false,
        userCanEditPermits: false,
      });
      expect(container.querySelector(".anticon-menu")).toBeNull();
    });

    it("disallows dragging once the draft is completed, even though the Order column stays visible", () => {
      const { container, getByText } = renderUnified({
        isFeatureEnabled: () => false,
        progress: { DFT: { start_date: "2025-01-01", end_date: "2025-02-01" } },
      });
      expect(getByText("Order")).toBeInTheDocument();
      expect(container.querySelector(".anticon-menu")).toBeNull();
    });
  });
});
