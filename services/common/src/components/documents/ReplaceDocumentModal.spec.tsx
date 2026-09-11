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

  it("maintains newest-first version ordering when a document is versioned and replaced", () => {
    const originalDoc = new MineDocument({
      ...MINEDOCUMENTS.records[0],
      document_name: "Original.pdf",
      versions: [
        {
          mine_document_version_guid: "v1-guid",
          document_name: "V1.pdf",
          upload_date: "2024-01-01",
        },
      ],
    });

    expect(originalDoc.versions).toHaveLength(1);
    expect(originalDoc.versions[0].document_name).toBe("V1.pdf");

    const connectedVersionV2 = {
      mine_document_version_guid: "v2-guid",
      document_name: "Original.pdf",
      upload_date: "2024-02-01",
    };

    const existingVersionsAsc = (originalDoc.versions ?? []).slice().reverse();
    const newVersionsChronological = [...existingVersionsAsc, connectedVersionV2 as any];

    const replacedDoc = new MineDocument({
      ...originalDoc,
      document_name: "Replacement.pdf",
      versions: newVersionsChronological,
    });

    expect(replacedDoc.document_name).toBe("Replacement.pdf");
    expect(replacedDoc.number_prev_versions).toBe(2);
    expect(replacedDoc.versions[0].document_name).toBe("Original.pdf");
    expect(replacedDoc.versions[1].document_name).toBe("V1.pdf");
  });
});
