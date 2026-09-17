import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdministrativeTab } from "@/components/noticeOfWork/applications/administrative/AdministrativeTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import {
  AUTHENTICATION,
  NOTICE_OF_WORK,
  PARTIES,
  STATIC_CONTENT,
} from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";
import { BULK_STATIC_CONTENT_RESPONSE } from "@mds/common/tests/mocks/dataMocks";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalActions from "@mds/common/redux/actions/modalActions";
import * as NOW_ACTIONS from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import * as DOCUMENT_ACTIONS from "@/actionCreators/documentActionCreator";

jest.mock("@mds/common/redux/actions/modalActions", () => ({
  ...jest.requireActual("@mds/common/redux/actions/modalActions"),
  openModal: jest.fn(jest.requireActual("@mds/common/redux/actions/modalActions").openModal),
  closeModal: jest.fn(jest.requireActual("@mds/common/redux/actions/modalActions").closeModal),
}));

jest.mock("@mds/common/redux/actionCreators/noticeOfWorkActionCreator", () => ({
  ...jest.requireActual("@mds/common/redux/actionCreators/noticeOfWorkActionCreator"),
  updateNoticeOfWorkApplication: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
}));

jest.mock("@/actionCreators/documentActionCreator", () => ({
  ...jest.requireActual("@/actionCreators/documentActionCreator"),
  generateNoticeOfWorkApplicationDocument: jest.fn(),
  fetchNoticeOfWorkApplicationContextTemplate: jest.fn(),
}));

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

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({ isFeatureEnabled: () => true }),
}));

// Reuses the mock's real "CAL" (Acknowledgement Letter) document type, which has both a DATE
// field and non-DATE fields on its form_spec, to exercise the date-formatting branch in the
// generate-document handlers.
const GENERATABLE_CAL_DOCUMENT_TYPE = NOW_MOCK.APPLICATION_DOCUMENT_TYPES.find(
  (docType) => docType.now_application_document_type_code === "CAL"
);
// A second generatable type is needed so the "Generate Documents" submenu list has more than
// one entry, exercising its sort-by-description comparator (never invoked for a single item).
const GENERATABLE_NPE_DOCUMENT_TYPE = NOW_MOCK.APPLICATION_DOCUMENT_TYPES.find(
  (docType) => docType.now_application_document_type_code === "NPE"
);

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
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
    userAccessData: [USER_ROLES.role_admin, USER_ROLES.role_edit_permits],
  },
} as any;

const stateWithGeneratableDocument = {
  ...initialState,
  [STATIC_CONTENT]: {
    ...initialState[STATIC_CONTENT],
    noticeOfWorkApplicationDocumentTypeOptions: [
      GENERATABLE_CAL_DOCUMENT_TYPE,
      GENERATABLE_NPE_DOCUMENT_TYPE,
    ],
  },
};

const props = {
  fixedTop: false,
};

describe("AdministrativeTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NOW_ACTIONS.updateNoticeOfWorkApplication as jest.Mock).mockReturnValue(() =>
      Promise.resolve()
    );
    (NOW_ACTIONS.fetchImportedNoticeOfWorkApplication as jest.Mock).mockReturnValue(() =>
      Promise.resolve()
    );
    (DOCUMENT_ACTIONS.generateNoticeOfWorkApplicationDocument as jest.Mock).mockReturnValue(() =>
      Promise.resolve()
    );
    (DOCUMENT_ACTIONS.fetchNoticeOfWorkApplicationContextTemplate as jest.Mock).mockReturnValue(
      () => Promise.resolve({ data: GENERATABLE_CAL_DOCUMENT_TYPE })
    );
  });

  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <AdministrativeTab {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });

  it("opens the Transfer to a Different Mine modal from the Actions menu", async () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <AdministrativeTab {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );

    await userEvent.click(screen.getByRole("button", { name: /Actions/i }));
    await userEvent.click(await screen.findByText("Transfer to a Different Mine"));

    expect(ModalActions.openModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: modalConfig.CHANGE_NOW_MINE,
        props: expect.objectContaining({ title: "Transfer Notice of Work" }),
      })
    );
  });

  it("opens the Edit Application Lat/Long modal from the Actions menu and dispatches an update on submit", async () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <AdministrativeTab {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );

    await userEvent.click(screen.getByRole("button", { name: /Actions/i }));
    await userEvent.click(await screen.findByText("Edit Application Lat/Long"));

    expect(ModalActions.openModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: modalConfig.CHANGE_NOW_LOCATION,
        props: expect.objectContaining({ title: "Edit Location" }),
      })
    );

    const [{ props: modalProps }] = (ModalActions.openModal as jest.Mock).mock.calls[
      (ModalActions.openModal as jest.Mock).mock.calls.length - 1
    ];
    await act(async () => {
      await modalProps.onSubmit({ latitude: 49.1, longitude: -123.4 });
    });

    expect(NOW_ACTIONS.updateNoticeOfWorkApplication).toHaveBeenCalledWith(
      { latitude: 49.1, longitude: -123.4 },
      NOW_MOCK.IMPORTED_NOTICE_OF_WORK.now_application_guid,
      "Successfully updated Notice of Work location"
    );
    await waitFor(() => {
      expect(NOW_ACTIONS.fetchImportedNoticeOfWorkApplication).toHaveBeenCalled();
      expect(ModalActions.closeModal).toHaveBeenCalled();
    });
  });

  it("generates a document from the Generate Documents submenu", async () => {
    render(
      <ReduxWrapper initialState={stateWithGeneratableDocument}>
        <BrowserRouter>
          <AdministrativeTab {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );

    await userEvent.click(screen.getByRole("button", { name: /Actions/i }));
    await userEvent.hover(await screen.findByText("Generate Documents"));
    await userEvent.click(await screen.findByText("Acknowledgement Letter"));

    await waitFor(() => {
      expect(DOCUMENT_ACTIONS.fetchNoticeOfWorkApplicationContextTemplate).toHaveBeenCalledWith(
        "CAL",
        NOW_MOCK.IMPORTED_NOTICE_OF_WORK.now_application_guid
      );
    });
    await waitFor(() => {
      expect(ModalActions.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          content: modalConfig.GENERATE_DOCUMENT,
          props: expect.objectContaining({ title: "Generate Acknowledgement Letter" }),
        })
      );
    });

    const generateDocumentCall = (ModalActions.openModal as jest.Mock).mock.calls.find(
      ([{ content }]) => content === modalConfig.GENERATE_DOCUMENT
    );
    const { props: modalProps } = generateDocumentCall[0];

    await act(async () => {
      await modalProps.onSubmit({ letter_dt: "2024-01-01", proponent_name: "Test Proponent" });
    });
    expect(DOCUMENT_ACTIONS.generateNoticeOfWorkApplicationDocument).toHaveBeenCalledWith(
      "CAL",
      expect.objectContaining({
        now_application_guid: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.now_application_guid,
      }),
      "Successfully created document and attached it to Notice of Work",
      false,
      expect.any(Function)
    );

    // Invoke the onDocumentGenerated callback directly: our mocked thunk doesn't run the real
    // implementation that would normally call it after a successful generate.
    const onDocumentGenerated = (
      DOCUMENT_ACTIONS.generateNoticeOfWorkApplicationDocument as jest.Mock
    ).mock.calls[0][4];
    onDocumentGenerated();
    expect(NOW_ACTIONS.fetchImportedNoticeOfWorkApplication).toHaveBeenCalledWith(
      NOW_MOCK.IMPORTED_NOTICE_OF_WORK.now_application_guid
    );

    (DOCUMENT_ACTIONS.generateNoticeOfWorkApplicationDocument as jest.Mock).mockClear();
    await act(async () => {
      modalProps.preview(GENERATABLE_CAL_DOCUMENT_TYPE, {
        letter_dt: "2024-01-01",
        proponent_name: "Test Proponent",
      });
    });
    expect(DOCUMENT_ACTIONS.generateNoticeOfWorkApplicationDocument).toHaveBeenCalledWith(
      "CAL",
      expect.objectContaining({
        now_application_guid: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.now_application_guid,
      }),
      "Successfully created the preview document",
      true,
      expect.any(Function)
    );
  });

  it("calls handleUpdateTier when AssignTier calls it", async () => {
    const stateWithExplorationType = {
      ...initialState,
      [NOTICE_OF_WORK]: {
        ...initialState[NOTICE_OF_WORK],
        noticeOfWork: {
          ...initialState[NOTICE_OF_WORK].noticeOfWork,
          notice_of_work_type_code: "MIN",
        },
      },
    };

    render(
      <ReduxWrapper initialState={stateWithExplorationType}>
        <BrowserRouter>
          <AdministrativeTab {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );

    await userEvent.click(screen.getByText("Mock AssignTier"));

    expect(NOW_ACTIONS.updateNoticeOfWorkApplication).toHaveBeenCalled();
    await waitFor(() => {
      expect(NOW_ACTIONS.fetchImportedNoticeOfWorkApplication).toHaveBeenCalled();
    });
  });

  it("calls handleUpdateInspectors when AssignInspectors calls it", async () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <AdministrativeTab {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );

    await userEvent.click(screen.getByText("Mock AssignInspectors"));

    expect(NOW_ACTIONS.updateNoticeOfWorkApplication).toHaveBeenCalled();
    await waitFor(() => {
      expect(NOW_ACTIONS.fetchImportedNoticeOfWorkApplication).toHaveBeenCalled();
    });
  });
});
