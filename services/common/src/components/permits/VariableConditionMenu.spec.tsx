import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import VariableConditionMenu, { getPermitPackageFileToken } from "./VariableConditionMenu";

describe("VariableConditionMenu", () => {
  it("renders correctly and matches the snapshot", () => {
    const { container } = render(
      <ReduxWrapper>
        <VariableConditionMenu conditionForm="MOCK_CONDITION_FORM" isManagementView />
      </ReduxWrapper>
    );
    fireEvent.click(container.querySelector("button"));
    expect(container.firstChild).toMatchSnapshot();
  });

  it("does not render Permit Package Files when isManagementView is true", () => {
    const { container } = render(
      <ReduxWrapper>
        <VariableConditionMenu conditionForm="MOCK_CONDITION_FORM" isManagementView />
      </ReduxWrapper>
    );
    fireEvent.click(container.querySelector("button"));
    expect(screen.queryByText("Permit Package Files")).not.toBeInTheDocument();
  });

  // The "Figures"/"Documents" submenu items are nested two levels deep inside the antd
  // Dropdown's popup Menu, which only mounts on a real hover-and-wait interaction (rc-menu's
  // submenu open delay) — not reliably simulated with a synchronous fireEvent in jsdom. The
  // ordering/labelling logic that feeds those items is exhaustively covered directly in
  // permitPackageDocuments.spec.ts, so this test only asserts the top-level category itself
  // renders (the actual integration point/flag gating), not its nested contents.
  it("renders the Permit Package Files category when not in management view", () => {
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

    const { container } = render(
      <ReduxWrapper initialState={{ [NOTICE_OF_WORK]: { noticeOfWork } }}>
        <VariableConditionMenu conditionForm="MOCK_CONDITION_FORM" />
      </ReduxWrapper>
    );
    fireEvent.click(container.querySelector("button"));

    expect(screen.getByText("Permit Package Files")).toBeInTheDocument();
  });

  it("builds the permit package file token as {permit_package_file:<guid>}", () => {
    expect(getPermitPackageFileToken("abc-123")).toBe("{permit_package_file:abc-123}");
  });
});
