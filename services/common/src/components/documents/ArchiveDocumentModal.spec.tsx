import React from "react";
import { render, screen } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINEDOCUMENTS } from "@mds/common/tests/mocks/dataMocks";
import ArchiveDocumentModal from "./ArchiveDocumentModal";

describe("ArchiveDocumentModal", () => {
  it("renders correctly and matches the snapshot", () => {
    const { container } = render(
      <ReduxWrapper>
        <ArchiveDocumentModal
          documents={MINEDOCUMENTS.records}
          handleSubmit={jest.fn().mockReturnValue(Promise.resolve())}
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows the given alert text and extra warning", () => {
    render(
      <ReduxWrapper>
        <ArchiveDocumentModal
          documents={MINEDOCUMENTS.records}
          handleSubmit={jest.fn().mockReturnValue(Promise.resolve())}
          alertMessage="Custom message"
          alertDescription="Custom description"
          extraWarning="This file is referenced in a permit condition."
        />
      </ReduxWrapper>
    );

    expect(screen.getByText("Custom message")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
    expect(screen.getByText("This file is referenced in a permit condition.")).toBeInTheDocument();
    expect(
      screen.queryByText("Archived files are not reviewed as part of the submission")
    ).not.toBeInTheDocument();
  });
});
