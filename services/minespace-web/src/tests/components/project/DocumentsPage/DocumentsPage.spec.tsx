import React from "react";
import { render } from "@testing-library/react";
import { DocumentsPage } from "@/components/pages/Project/DocumentsPage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props: any = {
  title: "mockTitle",
  documents: [
    ...MOCK.PROJECT_SUMMARY.documents,
    ...MOCK.INFORMATION_REQUIREMENTS_TABLE.documents,
    ...MOCK.MAJOR_MINES_APPLICATION.documents,
  ],
};

describe("DocumentsPage", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <DocumentsPage {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
