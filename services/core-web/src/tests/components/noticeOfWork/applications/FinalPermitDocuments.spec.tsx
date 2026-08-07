import React from "react";
import { render, screen } from "@testing-library/react";
import { FinalPermitDocuments } from "@/components/noticeOfWork/applications/FinalPermitDocuments";
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
    it("does not show locked 1.1 row when showInUnifiedView is false", () => {
      renderComponent({ showInUnifiedView: false });
      expect(document.querySelector('[data-row-key="application-form-1.1"]')).toBeNull();
    });

    it("does not show locked 1.1 row for non-NOW application types", () => {
      renderComponent({
        showInUnifiedView: true,
        noticeOfWork: { ...IMPORTED_NOTICE_OF_WORK, application_type_code: "AIA", documents: [] },
      });
      expect(document.querySelector('[data-row-key="application-form-1.1"]')).toBeNull();
    });

    it("does not show locked 1.1 row when no system-generated NTR exists", () => {
      renderComponent({
        showInUnifiedView: true,
        noticeOfWork: {
          ...IMPORTED_NOTICE_OF_WORK,
          documents: [
            { now_application_document_type_code: "OTH", is_system_generated: false, is_final_package: true, mine_document: {} },
          ],
        },
      });
      expect(document.querySelector('[data-row-key="application-form-1.1"]')).toBeNull();
    });

    it("does not show locked 1.1 row when technical review has not been completed", () => {
      renderComponent({
        showInUnifiedView: true,
        progress: {},
        noticeOfWork: {
          ...IMPORTED_NOTICE_OF_WORK,
          documents: [
            makeNtrDoc({ is_final_package: false, description: "Some other description" }),
          ],
        },
      });
      expect(document.querySelector('[data-row-key="application-form-1.1"]')).toBeNull();
    });

    it("shows the NA row when technical review is done but no qualifying NTR is in the package", () => {
      renderComponent({
        showInUnifiedView: true,
        progress: { REV: { end_date: "2025-01-01" } },
        noticeOfWork: {
          ...IMPORTED_NOTICE_OF_WORK,
          documents: [makeNtrDoc({ is_final_package: false })],
        },
      });
      expect(document.querySelector('[data-row-key="application-form-1.1"]')).toBeTruthy();
    });

    it("shows locked 1.1 row with NTR data when tech review done via progress.REV.end_date", () => {
      const ntrDoc = makeNtrDoc();
      renderComponent({
        showInUnifiedView: true,
        progress: { REV: { end_date: "2025-01-01" } },
        noticeOfWork: {
          ...IMPORTED_NOTICE_OF_WORK,
          documents: [ntrDoc],
        },
      });
      expect(document.querySelector('[data-row-key="application-form-1.1"]')).toBeTruthy();
    });

    it("picks the most recent qualifying NTR when multiple exist", () => {
      const olderNtr = makeNtrDoc({
        now_application_document_xref_guid: "ntr-xref-old",
        mine_document: { upload_date: "2024-06-01", mine_document_guid: "old-guid", document_manager_guid: null, document_name: "old.pdf" },
      });
      const newerNtr = makeNtrDoc({
        now_application_document_xref_guid: "ntr-xref-new",
        mine_document: { upload_date: "2025-01-15", mine_document_guid: "new-guid", document_manager_guid: null, document_name: "new.pdf" },
      });
      renderComponent({
        showInUnifiedView: true,
        progress: { REV: { end_date: "2025-01-01" } },
        noticeOfWork: {
          ...IMPORTED_NOTICE_OF_WORK,
          documents: [olderNtr, newerNtr],
        },
      });
      expect(document.querySelector('[data-row-key="application-form-1.1"]')).toBeTruthy();
      expect(document.querySelector('[data-row-key="ntr-xref-old"]')).toBeTruthy();
      expect(document.querySelector('[data-row-key="ntr-xref-new"]')).toBeNull();
    });
  });
});
