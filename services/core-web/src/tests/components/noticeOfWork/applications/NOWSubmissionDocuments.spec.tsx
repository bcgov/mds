import React from "react";
import { fireEvent, render, within } from "@testing-library/react";
import { NOWSubmissionDocuments } from "@/components/noticeOfWork/applications/NOWSubmissionDocuments";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  updateNoticeOfWorkApplication: jest.fn(),
  editNoticeOfWorkDocument: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  deleteNoticeOfWorkApplicationDocument: jest.fn(),
  createNoticeOfWorkApplicationImportSubmissionDocumentsJob: jest.fn(),
  fetchImportNoticeOfWorkSubmissionDocumentsJob: jest.fn(),
};
const props = {
  noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
  documents: [],
  noticeOfWorkApplicationDocumentTypeOptions: NOWMocks.DROPDOWN_APPLICATION_DOCUMENT_TYPES,
  isViewMode: false,
  selectedRows: null,
  categoriesToShow: ["ANS", "OTH"],
  disclaimerText: "This test is explaining the purpose of this section",
  isAdminView: false,
  addDescriptionColumn: true,
  importNowSubmissionDocumentsJob: {},
  noticeOfWorkApplicationDocumentTypeOptionsHash: {},
  now_application_guid: "23968472346",
  displayTableDescription: true,
  tableDescription: "mock description",
  hideImportStatusColumn: true,
  disableCategoryFilter: true,
  hideJobStatusColumn: false,
  showDescription: true,
  allowAfterProcess: true,
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
};
const spatialDocument = (filename: string) => ({
  mine_document_guid: `guid-${filename}`,
  document_manager_guid: `dm-${filename}`,
  filename,
  category: "Spatial File",
  is_imported_submission: true,
  mine_document_bundle_id: 7,
});

const renderTable = (overrides = {}) =>
  render(
    <ReduxWrapper initialState={initialState}>
      <BrowserRouter>
        <NOWSubmissionDocuments {...props} {...dispatchProps} {...overrides} />
      </BrowserRouter>
    </ReduxWrapper>
  );

describe("NOWSubmissionDocuments", () => {
  it("renders properly", () => {
    const { container: component } = renderTable();
    expect(component).toMatchSnapshot();
  });

  describe("spatial file rows", () => {
    const spatialDocuments = [
      spatialDocument("Antler_2026.shp"),
      spatialDocument("Antler_2026.dbf"),
      spatialDocument("Antler_2026.prj"),
      { ...spatialDocument("application.pdf"), category: "Application", mine_document_bundle_id: null },
    ];

    // Bundle 7 holds the shapefile parts and has been through Geomark validation.
    const withValidatedBundle = {
      noticeOfWork: {
        ...NOWMocks.IMPORTED_NOTICE_OF_WORK,
        spatial_document_bundles: [{ bundle_id: 7, validation_status: "VALID" }],
      },
    };

    it("gives every shapefile part its own row", () => {
      const { getByText } = renderTable({ documents: spatialDocuments });

      expect(getByText("Antler_2026.shp")).toBeInTheDocument();
      expect(getByText("Antler_2026.dbf")).toBeInTheDocument();
      expect(getByText("Antler_2026.prj")).toBeInTheDocument();
      expect(getByText("application.pdf")).toBeInTheDocument();
    });

    it("renders the per-document columns on spatial rows like any other document", () => {
      const { getByText } = renderTable({ documents: spatialDocuments });

      const spatialRow = getByText("Antler_2026.shp").closest("tr");
      const pdfRow = getByText("application.pdf").closest("tr");

      expect(within(spatialRow).queryAllByTitle(/Package$/)).toHaveLength(
        within(pdfRow).queryAllByTitle(/Package$/).length
      );
      expect(within(spatialRow).queryAllByTitle(/Package$/).length).toBeGreaterThan(0);
    });

    it("leaves rows plain where no Spatial Files panel sits above the table", () => {
      const { getByText, queryAllByText } = renderTable({
        documents: spatialDocuments,
        ...withValidatedBundle,
      });

      expect(queryAllByText("in Spatial Files above")).toHaveLength(0);
      expect(getByText("Antler_2026.shp").closest("tr")).not.toHaveClass("spatial-file-row");
    });

    it("links validated spatial rows to the panel and reports the clicked document", () => {
      const onSpatialFileLinkClick = jest.fn();
      const { getByText, getAllByText } = renderTable({
        documents: spatialDocuments,
        onSpatialFileLinkClick,
        ...withValidatedBundle,
      });

      expect(getAllByText("in Spatial Files above")).toHaveLength(3);

      const spatialRow = getByText("Antler_2026.shp").closest("tr");
      fireEvent.click(within(spatialRow).getByText("in Spatial Files above"));

      expect(onSpatialFileLinkClick).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: "Antler_2026.shp",
          mine_document_bundle_id: 7,
        })
      );
    });

    // The tint marks exactly the rows carrying the link, so the two never disagree.
    it("tints the linked rows so they read as a set", () => {
      const { getByText } = renderTable({
        documents: spatialDocuments,
        onSpatialFileLinkClick: jest.fn(),
        ...withValidatedBundle,
      });

      expect(getByText("Antler_2026.shp").closest("tr")).toHaveClass("spatial-file-row");
      expect(getByText("application.pdf").closest("tr")).not.toHaveClass("spatial-file-row");
    });

    it("leaves spatial files that are not in the Spatial Files panel untouched", () => {
      const unvalidated = [
        { ...spatialDocument("Orphan_2026.shp"), mine_document_bundle_id: null },
        { ...spatialDocument("Pending_2026.shp"), mine_document_bundle_id: 99 },
      ];
      const { getByText, queryAllByText } = renderTable({
        documents: unvalidated,
        onSpatialFileLinkClick: jest.fn(),
        ...withValidatedBundle,
      });

      expect(getByText("Orphan_2026.shp").closest("tr")).not.toHaveClass("spatial-file-row");
      expect(getByText("Pending_2026.shp").closest("tr")).not.toHaveClass("spatial-file-row");
      expect(queryAllByText("in Spatial Files above")).toHaveLength(0);
    });
  });
});
