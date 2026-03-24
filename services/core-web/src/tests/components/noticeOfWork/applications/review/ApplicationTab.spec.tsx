import React from "react";
import { render } from "@testing-library/react";
import { ApplicationTab } from "@/components/noticeOfWork/applications/review/ApplicationTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import * as FORM from "@/constants/forms";
import { AUTHENTICATION, NOTICE_OF_WORK, PARTIES, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";

import { BULK_STATIC_CONTENT_RESPONSE } from "@mds/common/tests/mocks/dataMocks";

const contactsWithParty = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.contacts.map((c) => ({
  ...c,
  party: {
    party_guid: "12345678-1234-1234-1234-123456789012",
    name: "Mock Party Name",
    address: [],
  },
}));

const initialState = {
  form: {
    [FORM.EDIT_NOTICE_OF_WORK]: {
      values: {
        ...NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
        contacts: contactsWithParty,
      },
      syncErrors: {},
      submitFailed: false,
    },
  },
  [NOTICE_OF_WORK]: {
    noticeOfWork: {
      ...NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
      contacts: contactsWithParty,
    },
    originalNoticeOfWork: {
      ...NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
      contacts: contactsWithParty,
    },
    importNowSubmissionDocumentsJob: {},
    reclamationSummary: [],
    applicationDelays: [],
  },
  [PARTIES]: {
    inspectors: [],
    consultationAdvisors: [],
  },
  [STATIC_CONTENT]: {
    ...BULK_STATIC_CONTENT_RESPONSE,
    noticeOfWorkApplicationDocumentTypeOptions: [],
  },
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_admin],
  }
};

const props = {
  fixedTop: false,
  isNoticeOfWorkTypeDisabled: true,
  showActionsAndProgress: true,
};

describe("ApplicationTab", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <ApplicationTab {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
