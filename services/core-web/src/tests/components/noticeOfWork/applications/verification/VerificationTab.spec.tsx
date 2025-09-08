// Mocks must come before importing the component under test
jest.mock("react-redux", () => {
  const actual = jest.requireActual("react-redux");
  return { ...actual, useDispatch: jest.fn() };
});
jest.mock("@mds/common/redux/actionCreators/noticeOfWorkActionCreator", () => ({
  importNoticeOfWorkApplication: jest.fn((guid: string, payload: any) => {
    const thunk: any = () => ({});
    thunk.__args = { guid, payload };
    return thunk;
  }),
  fetchImportedNoticeOfWorkApplication: jest.fn((guid: string) => {
    const thunk: any = () => ({});
    thunk.__args = { guid };
    return thunk;
  }),
}));
// Mock the child form to expose props and an easy submit trigger
jest.mock(
  "@/components/noticeOfWork/applications/verification/VerifyApplicationInformationForm",
  () => {
    return {
      __esModule: true,
      default: ({ onSubmit, isImporting, noticeOfWork, originalNoticeOfWork, mineGuid }: any) => (
        <div>
          <div data-testid="child-props">
            {JSON.stringify({
              isImporting,
              noticeOfWorkGuid: noticeOfWork.now_application_guid,
              originalNoticeOfWorkGuid: originalNoticeOfWork.now_application_guid,
              mineGuid,
            })}
          </div>
          <button onClick={() => onSubmit({ contacts: [], other_field: "keep" })}>submit</button>
        </div>
      ),
    };
  }
);

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VerificationTab } from "@/components/noticeOfWork/applications/verification/VerificationTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { useDispatch } from "react-redux";
import {
  importNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";

const makeDispatchProps = () => ({
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  importNoticeOfWorkApplication: jest.fn(),
});
const reducerProps = {
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  originalNoticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  mineGuid: MOCK.MINES.mineIds[0],
};

// Mock react-redux and action creators used by the component-under-test
jest.mock("react-redux", () => {
  const actual = jest.requireActual("react-redux");
  return { ...actual, useDispatch: jest.fn() };
});
jest.mock("@mds/common/redux/actionCreators/noticeOfWorkActionCreator", () => ({
  importNoticeOfWorkApplication: jest.fn(() => () => ({})),
  fetchImportedNoticeOfWorkApplication: jest.fn(() => () => ({})),
}));

// Mock the child form to expose props and an easy submit trigger
jest.mock(
  "@/components/noticeOfWork/applications/verification/VerifyApplicationInformationForm",
  () => {
    return {
      __esModule: true,
      default: ({ onSubmit, isImporting, noticeOfWork, originalNoticeOfWork, mineGuid }: any) => (
        <div>
          <div data-testid="child-props">
            {JSON.stringify({ isImporting, noticeOfWorkGuid: noticeOfWork.now_application_guid, originalNoticeOfWorkGuid: originalNoticeOfWork.now_application_guid, mineGuid })}
          </div>
          <button onClick={() => onSubmit({ contacts: [], other_field: "keep" })}>submit</button>
        </div>
      ),
    };
  }
);


describe("VerificationTab", () => {
  it("renders and passes props to child form", () => {
    render(<VerificationTab {...makeDispatchProps()} {...reducerProps} />);
    const child = screen.getByTestId("child-props");
    const payload = JSON.parse(child.textContent || "{}");
    expect(payload.mineGuid).toBe(reducerProps.mineGuid);
    expect(payload.noticeOfWorkGuid).toBe(reducerProps.noticeOfWork.now_application_guid);
    expect(payload.originalNoticeOfWorkGuid).toBe(
      reducerProps.originalNoticeOfWork.now_application_guid
    );
    expect(payload.isImporting).toBe(false);
  });

  it("handleNOWImport calls actions in order and toggles isImporting", async () => {
    const dispatchMock = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(dispatchMock);

    let resolveImport!: () => void;
    let resolveFetch!: () => void;
    const importPromise = new Promise<void>((res) => (resolveImport = res));
    const fetchPromise = new Promise<void>((res) => (resolveFetch = res));

    // First dispatch resolves with importPromise, then with fetchPromise
    dispatchMock.mockImplementationOnce(() => importPromise).mockImplementationOnce(
      () => fetchPromise
    );

    render(<VerificationTab {...makeDispatchProps()} {...reducerProps} />);

    // Before submit
    let child = screen.getByTestId("child-props");
    expect(JSON.parse(child.textContent || "{}").isImporting).toBe(false);

    // Trigger submit
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    // After submit, importing toggled
    child = screen.getByTestId("child-props");
    expect(JSON.parse(child.textContent || "{}").isImporting).toBe(true);

    // import action creator called with expected args
    expect(importNoticeOfWorkApplication).toHaveBeenCalledTimes(1);
    const [calledGuid, calledPayload] = (importNoticeOfWorkApplication as jest.Mock).mock.calls[0];
    expect(calledGuid).toBe(reducerProps.noticeOfWork.now_application_guid);
    expect(calledPayload).toMatchObject({ contacts: [], other_field: "keep" });

    // Resolve import then fetch is called
    resolveImport();
    await Promise.resolve();
    // fetch action creator called with expected args
    expect(fetchImportedNoticeOfWorkApplication).toHaveBeenCalledWith(
      reducerProps.noticeOfWork.now_application_guid
    );

    // Resolve fetch and ensure importing toggles off
    resolveFetch();
    await waitFor(() => {
      const importing = JSON.parse(
        screen.getByTestId("child-props").textContent || "{}"
      ).isImporting;
      expect(importing).toBe(false);
    });
  });
});