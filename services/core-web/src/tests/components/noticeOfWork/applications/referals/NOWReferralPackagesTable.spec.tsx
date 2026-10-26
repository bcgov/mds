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
});
