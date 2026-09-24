import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import ConditionVariableText from "./ConditionVariableText";

const noticeOfWork = {
  application_type_code: "NOW",
  documents: [
    {
      now_application_document_xref_guid: "fig-guid",
      is_final_package: true,
      final_package_order: 1,
      permit_package_document_type_code: "FIGURE",
      preamble_title: "Site Map",
    },
  ],
  filtered_submission_documents: [],
  application_progress: [],
};

const renderWithNow = (text: string) =>
  render(
    <ReduxWrapper initialState={{ [NOTICE_OF_WORK]: { noticeOfWork } }}>
      <ConditionVariableText text={text} />
    </ReduxWrapper>
  );

describe("ConditionVariableText", () => {
  it("renders a resolved permit package file reference as a green label", () => {
    const { container } = renderWithNow("See {permit_package_file:fig-guid} for details.");

    const label = container.querySelector(".permit-package-file-reference");
    expect(label).not.toBeNull();
    expect(label?.textContent).toBe("1 Site Map");
    expect(label?.querySelector("svg.permit-package-file-reference-icon")).not.toBeNull();
    expect(container.querySelector("mark.highlight")).toBeNull();
  });

  it("renders a broken permit package file reference as a red label with a hover tooltip", () => {
    const { container } = renderWithNow("See {permit_package_file:deleted-guid} for details.");

    expect(container.querySelector(".permit-package-file-reference")).toBeNull();
    expect(container.querySelector("mark.highlight")).toBeNull();

    const broken = container.querySelector(".permit-package-file-reference-broken");
    expect(broken).not.toBeNull();
    expect(broken?.querySelector("svg.permit-package-file-reference-broken-icon")).not.toBeNull();
    expect(broken?.getAttribute("tabIndex")).toBe("0");
  });

  it("exposes the broken reference's visible label and an aria-describedby explanation for screen readers", () => {
    const { container } = renderWithNow("See {permit_package_file:deleted-guid} for details.");

    const broken = container.querySelector(".permit-package-file-reference-broken") as HTMLElement;
    const describedById = broken.getAttribute("aria-describedby");
    expect(describedById).toBeTruthy();

    const description = container.querySelector(`#${describedById}`);
    expect(description).not.toBeNull();
    expect(description?.className).toBe("sr-only");
    expect(description?.textContent).toBe(
      "This file has either been removed from the permit package or deleted altogether."
    );

    // The visible label text stays separate from the hidden description.
    const visibleSpans = Array.from(broken.querySelectorAll("span")).filter(
      (span) => span.id !== describedById
    );
    expect(visibleSpans.map((span) => span.textContent)).toContain("Reference unavailable");
  });

  it("still highlights other condition variables in yellow", () => {
    const { container } = renderWithNow("The mine is {mine_name}.");

    const mark = container.querySelector("mark.highlight");
    expect(mark?.textContent).toBe("{mine_name}");
    expect(container.querySelector(".permit-package-file-reference")).toBeNull();
  });

  it("handles text with no variables at all", () => {
    const { container } = renderWithNow("No variables here.");

    expect(container.querySelector("mark.highlight")).toBeNull();
    expect(container.textContent).toBe("No variables here.");
  });

  it("handles multiple mixed tokens in the same condition", () => {
    const { container } = renderWithNow(
      "{mine_name} references {permit_package_file:fig-guid} and {mine_no}."
    );

    expect(container.querySelectorAll("mark.highlight")).toHaveLength(2);
    expect(container.querySelector(".permit-package-file-reference")?.textContent).toBe(
      "1 Site Map"
    );
  });
});
