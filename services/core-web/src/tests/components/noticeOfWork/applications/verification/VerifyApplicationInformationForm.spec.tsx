import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VerifyApplicationInformationForm } from "@/components/noticeOfWork/applications/verification/VerifyApplicationInformationForm";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import * as FORM from "@/constants/forms";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { MemoryRouter } from "react-router-dom";

// Mock Antd Popconfirm to immediately call onConfirm when its child is clicked
jest.mock("antd", () => {
  const actual = jest.requireActual("antd");
  const Popconfirm = ({ onConfirm, children }: any) => (
    <div data-testid="popconfirm-mock" onClick={onConfirm}>
      {children}
    </div>
  );
  return { ...actual, Popconfirm };
});

// Mock heavy/connected children and the form wrapper to avoid Redux/form dependencies
jest.mock("@/components/Forms/noticeOfWork/EditNOWMineAndLocation", () => () => (
  <div data-testid="edit-now" />
));
jest.mock("@/components/Forms/noticeOfWork/VerifyNoWContacts", () => () => (
  <div data-testid="verify-contacts" />
));
jest.mock("@mds/common/components/forms/FormWrapper", () => ({ children }: any) => (
  <form data-testid="form-wrapper">{children}</form>
));
jest.mock("@/components/common/wrappers/AuthorizationWrapper", () => ({ children }: any) => (
  <>{children}</>
));

const dispatchProps = {
  onSubmit: jest.fn(),
};
const reducerProps = {
  longitude: "",
  latitude: "",
  // TODO: This really needs a type. The NoW types neeeds an overhaul so setting to any for now...
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK as any,
  initialValues: NOW_MOCK.NOTICE_OF_WORK,
  contacts: NOW_MOCK.NOTICE_OF_WORK.contacts,
  originalNoticeOfWork: NOW_MOCK.NOTICE_OF_WORK as any,
  mineGuid: MOCK.MINES.mineIds[0],
  submitting: false,
};

describe("VerifyApplicationInformationForm", () => {
  const baseInitialFormState = {
    form: {
      [FORM.VERIFY_NOW_APPLICATION_FORM]: {
        values: {
          mine_guid: reducerProps.mineGuid,
          latitude: reducerProps.latitude,
          longitude: reducerProps.longitude,
          contacts: reducerProps.contacts,
        },
      },
    },
  } as any;

  it("renders core text and snapshot (smoke)", () => {
    const { asFragment } = render(
      <ReduxWrapper initialState={baseInitialFormState}>
        <VerifyApplicationInformationForm
          {...dispatchProps}
          {...reducerProps}
          isImporting={false}
        />
      </ReduxWrapper>
    );
    expect(screen.getByText(/Verify Mine/i)).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("shows confirmed contacts count and disables submit until all contacts have party and mine is selected", async () => {
    const reset = jest.fn();
    const change = jest.fn();
    const clearAllSearchResults = jest.fn();

    const contactFormValues = [
      { contacttype: "agent", party_guid: "1111-1111" },
      { contacttype: "applicant" },
      { contacttype: "owner", party_guid: "2222-2222" },
    ];

    const { rerender } = render(
      <ReduxWrapper initialState={baseInitialFormState}>
        <VerifyApplicationInformationForm
          {...dispatchProps}
          noticeOfWork={NOW_MOCK.NOTICE_OF_WORK as any}
          originalNoticeOfWork={NOW_MOCK.NOTICE_OF_WORK as any}
          mineGuid={MOCK.MINES.mineIds[0]}
          mine_guid={MOCK.MINES.mineIds[0]}
          latitude=""
          longitude=""
          contactFormValues={contactFormValues}
          isImporting={false}
          reset={reset}
          change={change}
          clearAllSearchResults={clearAllSearchResults}
          initialValues={NOW_MOCK.NOTICE_OF_WORK}
        />
      </ReduxWrapper>
    );

    expect(screen.getByText(/2\/3 contacts confirmed/i)).toBeInTheDocument();
    const submitBtnInitial = screen.getByRole("button", { name: /verify application/i });
    expect(submitBtnInitial).toBeDisabled();

    // When all contacts have a party, button enables and no warning text
    const allConfirmed = contactFormValues.map((c) => ({ ...c, party_guid: c.party_guid || "3333-3333" }));
    rerender(
      <ReduxWrapper initialState={baseInitialFormState}>
        <VerifyApplicationInformationForm
          {...dispatchProps}
          noticeOfWork={NOW_MOCK.NOTICE_OF_WORK as any}
          originalNoticeOfWork={NOW_MOCK.NOTICE_OF_WORK as any}
          mineGuid={MOCK.MINES.mineIds[0]}
          mine_guid={MOCK.MINES.mineIds[0]}
          latitude=""
          longitude=""
          contactFormValues={allConfirmed}
          isImporting={false}
          reset={reset}
          change={change}
          clearAllSearchResults={clearAllSearchResults}
          initialValues={NOW_MOCK.NOTICE_OF_WORK}
        />
      </ReduxWrapper>
    );
    expect(screen.getByText(/3\/3 contacts confirmed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verify application/i })).toBeEnabled();
    expect(screen.queryByText(/A mine must be associated/i)).not.toBeInTheDocument();

    // Remove mine -> disables again and shows warning
    rerender(
      <ReduxWrapper initialState={baseInitialFormState}>
        <VerifyApplicationInformationForm
          {...dispatchProps}
          noticeOfWork={NOW_MOCK.NOTICE_OF_WORK as any}
          originalNoticeOfWork={NOW_MOCK.NOTICE_OF_WORK as any}
          mineGuid={MOCK.MINES.mineIds[0]}
          mine_guid=""
          latitude=""
          longitude=""
          contactFormValues={allConfirmed}
          isImporting={false}
          reset={reset}
          change={change}
          clearAllSearchResults={clearAllSearchResults}
          initialValues={NOW_MOCK.NOTICE_OF_WORK}
        />
      </ReduxWrapper>
    );
    expect(screen.getByRole("button", { name: /verify application/i })).toBeDisabled();
    expect(screen.getByText(/A mine must be associated to this application/i)).toBeInTheDocument();
  });

  it("handleReset calls reset/change/clear via mocked Popconfirm", async () => {
    const reset = jest.fn();
    const change = jest.fn();
    const clearAllSearchResults = jest.fn();

    const originalNoticeOfWork = {
      ...NOW_MOCK.NOTICE_OF_WORK,
      contacts: [
        { contacttype: "agent", party_guid: "aaaa-bbbb" },
        { contacttype: "owner" },
      ],
    } as any;

    render(
      <MemoryRouter>
        <ReduxWrapper initialState={baseInitialFormState}>
          <VerifyApplicationInformationForm
            {...dispatchProps}
            noticeOfWork={NOW_MOCK.NOTICE_OF_WORK as any}
            originalNoticeOfWork={originalNoticeOfWork as any}
            mineGuid={MOCK.MINES.mineIds[0]}
            mine_guid={MOCK.MINES.mineIds[0]}
            latitude=""
            longitude=""
            contactFormValues={[]}
            isImporting={false}
            reset={reset}
            change={change}
            clearAllSearchResults={clearAllSearchResults}
            initialValues={NOW_MOCK.NOTICE_OF_WORK}
          />
        </ReduxWrapper>
      </MemoryRouter>
    );

    // Click the mocked Popconfirm wrapper (it calls onConfirm immediately)
    await userEvent.click(screen.getByText(/cancel/i));

    expect(reset).toHaveBeenCalledWith(FORM.VERIFY_NOW_APPLICATION_FORM);
    expect(change).toHaveBeenCalledWith(
      FORM.VERIFY_NOW_APPLICATION_FORM,
      "contacts",
      originalNoticeOfWork.contacts
    );
    expect(clearAllSearchResults).toHaveBeenCalled();
  });
});