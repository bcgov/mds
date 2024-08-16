import React from "react";
import { render } from "@testing-library/react";
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
});
