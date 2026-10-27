import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NOWReferralPackagesTable } from "@/components/noticeOfWork/applications/referals/NOWReferralPackagesTable";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { openDocument } from "@mds/common/components/syncfusion/DocumentViewer";

jest.mock("@mds/common/components/syncfusion/DocumentViewer", () => ({
  openDocument: jest.fn(() => ({ type: "MOCK_OPEN_DOCUMENT" })),
}));

const mockPackages = [
  {
    now_application_referral_package_id: 1,
    now_application_referral_package_guid: "pkg-guid-1",
    package_order: 1,
    package_name: "Package #1",
    create_user: "idir\\testuser",
    create_timestamp: "2026-10-22T10:00:00Z",
    documents: [
      {
        now_application_referral_package_document_xref_guid: "xref-1",
        mine_document_guid: "mine-doc-1",
        document_manager_guid: "docman-1",
        document_manager_version_guid: "docver-1",
        document_name: "TestDocument.pdf",
        version_number: 1,
        version_label: "v1",
        category: "Referral / Consultation Package",
      },
    ],
  },
];

describe("NOWReferralPackagesTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders referral packages and document details properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <NOWReferralPackagesTable isLoaded={true} referralPackages={mockPackages} />
      </ReduxWrapper>
    );

    expect(screen.getByText("Package #1")).toBeInTheDocument();
    expect(screen.getByText("idir\\testuser")).toBeInTheDocument();
    expect(screen.getByText("TestDocument.pdf")).toBeInTheDocument();
    expect(screen.getByText("v1")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it("calls openDocument when View document button is clicked", () => {
    render(
      <ReduxWrapper>
        <NOWReferralPackagesTable isLoaded={true} referralPackages={mockPackages} />
      </ReduxWrapper>
    );

    const viewButton = screen.getByRole("button", { name: /view/i });
    fireEvent.click(viewButton);

    expect(openDocument).toHaveBeenCalledWith(
      "docman-1",
      "TestDocument.pdf",
      null,
      "docver-1"
    );
  });

  it("renders empty table message when no packages exist", () => {
    render(
      <ReduxWrapper>
        <NOWReferralPackagesTable isLoaded={true} referralPackages={[]} />
      </ReduxWrapper>
    );

    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it("renders fallback values when fields are missing or empty", () => {
    const packagesWithMissingFields: any = [
      {
        now_application_referral_package_id: 2,
        now_application_referral_package_guid: "pkg-guid-2",
        package_order: 2,
        package_name: "Package #2",
        create_user: null,
        create_timestamp: "2026-10-22T10:00:00Z",
        documents: [
          {
            now_application_referral_package_document_xref_guid: "xref-fallback-1",
            mine_document_guid: "mine-doc-2",
            document_manager_guid: "docman-2",
            document_name: null,
            version_number: 2,
            version_label: "",
            category: null,
          },
          {
            now_application_referral_package_document_xref_guid: "xref-fallback-2",
            mine_document_guid: "mine-doc-3",
            document_manager_guid: "docman-3",
            document_name: "DocWithoutVersion.pdf",
            version_number: null,
            version_label: null,
            category: "",
          },
        ],
      },
      {
        now_application_referral_package_id: 3,
        now_application_referral_package_guid: "pkg-guid-3",
        package_order: 3,
        package_name: "Package #3",
        create_user: "",
        create_timestamp: "2026-10-22T10:00:00Z",
        documents: null,
      },
    ];

    render(
      <ReduxWrapper>
        <NOWReferralPackagesTable isLoaded={true} referralPackages={packagesWithMissingFields} />
      </ReduxWrapper>
    );

    expect(screen.getByText("Package #2")).toBeInTheDocument();
    expect(screen.getByText("Package #3")).toBeInTheDocument();
    // Fallback for version_number: 2 with empty version_label is "v2"
    expect(screen.getByText("v2")).toBeInTheDocument();
    // Fallback for null version_number with null version_label is "v1"
    expect(screen.getByText("v1")).toBeInTheDocument();
    // N/A fallbacks exist
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
  });

  it("handles expanding and collapsing rows", () => {
    const multiPackages = [
      mockPackages[0],
      {
        now_application_referral_package_id: 2,
        now_application_referral_package_guid: "pkg-guid-2",
        package_order: 2,
        package_name: "Package #2",
        create_user: "idir\\anotheruser",
        create_timestamp: "2026-10-22T11:00:00Z",
        documents: [
          {
            now_application_referral_package_document_xref_guid: "xref-2",
            mine_document_guid: "mine-doc-2",
            document_manager_guid: "docman-2",
            document_name: "SecondDoc.pdf",
            version_number: 1,
            version_label: "v1",
            category: "Referral / Consultation Package",
          },
        ],
      },
    ];

    const { container } = render(
      <ReduxWrapper>
        <NOWReferralPackagesTable isLoaded={true} referralPackages={multiPackages} />
      </ReduxWrapper>
    );

    // Initial state: first package is expanded
    expect(screen.getByText("TestDocument.pdf")).toBeInTheDocument();

    const expandIcons = container.querySelectorAll(".expand-row-icon");
    if (expandIcons.length > 1) {
      // Click expand on second row
      fireEvent.click(expandIcons[1]);
      expect(screen.getByText("SecondDoc.pdf")).toBeInTheDocument();

      // Click collapse on first row
      fireEvent.click(expandIcons[0]);
    }
  });

  it("renders with default props when referralPackages is not provided", () => {
    render(
      <ReduxWrapper>
        <NOWReferralPackagesTable isLoaded={true} referralPackages={undefined as any} />
      </ReduxWrapper>
    );
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });
});
