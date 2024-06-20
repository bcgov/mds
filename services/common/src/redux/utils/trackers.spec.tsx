import React from "react";
import { render } from "@testing-library/react";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { PageTracker, MatomoLinkTracing } from "@mds/common/redux/utils/trackers";

jest.mock("@datapunt/matomo-tracker-react", () => ({
  useMatomo: jest.fn(),
}));

const mockUseMatomo = useMatomo as jest.Mock;

describe("PageTracker", () => {
  it("should call trackPageView with the correct title", () => {
    const trackPageView = jest.fn();
    mockUseMatomo.mockReturnValue({ trackPageView });

    render(<PageTracker title="Test Page" />);

    expect(trackPageView).toHaveBeenCalledWith({ documentTitle: "Test Page" });
  });
});

describe("MatomoLinkTracing", () => {
  it("should call enableLinkTracking", () => {
    const enableLinkTracking = jest.fn();
    mockUseMatomo.mockReturnValue({ enableLinkTracking });

    render(<MatomoLinkTracing />);

    expect(enableLinkTracking).toHaveBeenCalled();
  });
});
