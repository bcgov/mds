import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINEDOCUMENTS } from "@mds/common/tests/mocks/dataMocks";
import DeleteDocumentModal from "./DeleteDocumentModal";
import { MineDocument } from "@mds/common/models/documents/document";

describe("DeleteDocumentModal", () => {
  it("renders correctly and matches the snapshot", () => {
    const { container } = render(
      <ReduxWrapper>
        <DeleteDocumentModal
          documents={MINEDOCUMENTS.records.map((d) => new MineDocument(d))}
          handleSubmit={jest.fn().mockReturnValue(Promise.resolve())}
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
