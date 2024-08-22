import React from "react";
import ReplaceDocumentModal from "@mds/common/components/documents/ReplaceDocumentModal";

import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINEDOCUMENTS } from "@mds/common/tests/mocks/dataMocks";
import { MineDocument } from "@mds/common/models/documents/document";

describe("ReplaceDocumentModal", () => {
  it("renders correctly and matches the snapshot", () => {
    const { container } = render(
      <ReduxWrapper>
        <ReplaceDocumentModal
          document={new MineDocument(MINEDOCUMENTS.records[0])}
          handleSubmit={jest.fn().mockReturnValue(Promise.resolve())}
          alertMessage="This is a test alert message."
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
