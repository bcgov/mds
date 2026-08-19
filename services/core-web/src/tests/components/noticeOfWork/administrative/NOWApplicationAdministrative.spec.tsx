import React from "react";
import { render } from "@testing-library/react";
import { NOWApplicationAdministrative } from "@/components/noticeOfWork/applications/administrative/NOWApplicationAdministrative";
import { IMPORTED_NOTICE_OF_WORK } from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const props = {
  inspectors: [],
  consultationAdvisors: [],
  handleUpdateInspectors: jest.fn(),
  handleUpdateTier: jest.fn(),
  isLoaded: true,
};

// Covers the Reclamation Securities documents filter's SDO branch, which the base mock's
// documents array (empty) never exercises.
const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: {
      ...IMPORTED_NOTICE_OF_WORK,
      documents: [
        {
          now_application_document_xref_guid: "sdo-doc",
          now_application_document_sub_type_code: "SDO",
          mine_document: {
            mine_document_guid: "sdo-doc-guid",
            document_name: "security.pdf",
          },
        },
        {
          now_application_document_xref_guid: "gdo-doc",
          now_application_document_sub_type_code: "GDO",
          mine_document: {
            mine_document_guid: "gdo-doc-guid",
            document_name: "government.pdf",
          },
        },
      ],
    },
    applicationDelays: [],
  }
};

describe("NOWApplicationAdministrative", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <NOWApplicationAdministrative {...props} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
