import React from "react";
import { render, screen } from "@testing-library/react";
import { ApplicationTab } from "@/components/noticeOfWork/applications/review/ApplicationTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import * as NOW_ACTIONS from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";

jest.mock("@/components/noticeOfWork/applications/verification/AssignTier", () => ({ handleUpdateTier }: any) => (
  <button onClick={() => handleUpdateTier({ now_application_tier_code: "1" })}>
    Mock AssignTier
  </button>
));

jest.mock("@/components/noticeOfWork/applications/verification/AssignInspectors", () => ({ handleUpdateInspectors }: any) => (
  <button onClick={() => handleUpdateInspectors({ lead_inspector_party_guid: "abc" })}>
    Mock AssignInspectors
  </button>
));

jest.mock("@mds/common/redux/actionCreators/noticeOfWorkActionCreator", () => ({
  ...jest.requireActual("@mds/common/redux/actionCreators/noticeOfWorkActionCreator"),
  updateNoticeOfWorkApplication: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
}));

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({ isFeatureEnabled: () => true }),
}));

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
} as any;

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

  it("calls handleUpdateTier when AssignTier calls it", async () => {
    const stateWithNoInspector = {
      ...initialState,
      [NOTICE_OF_WORK]: {
        ...initialState[NOTICE_OF_WORK],
        noticeOfWork: {
          ...initialState[NOTICE_OF_WORK].noticeOfWork,
          lead_inspector_party_guid: null,
          imported_to_core: true,
          notice_of_work_type_code: "MIN",
        },
      },
    };

    (NOW_ACTIONS.updateNoticeOfWorkApplication as jest.Mock).mockReturnValue(() => Promise.resolve());
    (NOW_ACTIONS.fetchImportedNoticeOfWorkApplication as jest.Mock).mockReturnValue(() => Promise.resolve());

    render(
      <ReduxWrapper initialState={stateWithNoInspector}>
        <BrowserRouter>
          <ApplicationTab {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );

    const assignTierBtn = screen.getByText("Mock AssignTier");
    await userEvent.click(assignTierBtn);

    expect(NOW_ACTIONS.updateNoticeOfWorkApplication).toHaveBeenCalled();
    expect(NOW_ACTIONS.fetchImportedNoticeOfWorkApplication).toHaveBeenCalled();
  });

  it("calls handleUpdateInspectors when AssignInspectors calls it", async () => {
    const stateWithNoInspector = {
      ...initialState,
      [NOTICE_OF_WORK]: {
        ...initialState[NOTICE_OF_WORK],
        noticeOfWork: {
          ...initialState[NOTICE_OF_WORK].noticeOfWork,
          lead_inspector_party_guid: null,
          imported_to_core: true,
        },
      },
    };

    (NOW_ACTIONS.updateNoticeOfWorkApplication as jest.Mock).mockReturnValue(() => Promise.resolve());
    (NOW_ACTIONS.fetchImportedNoticeOfWorkApplication as jest.Mock).mockReturnValue(() => Promise.resolve());

    render(
      <ReduxWrapper initialState={stateWithNoInspector}>
        <BrowserRouter>
          <ApplicationTab {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );

    const assignInspectorsBtn = screen.getByText("Mock AssignInspectors");
    await userEvent.click(assignInspectorsBtn);

    expect(NOW_ACTIONS.updateNoticeOfWorkApplication).toHaveBeenCalled();
    expect(NOW_ACTIONS.fetchImportedNoticeOfWorkApplication).toHaveBeenCalled();
  });
});
