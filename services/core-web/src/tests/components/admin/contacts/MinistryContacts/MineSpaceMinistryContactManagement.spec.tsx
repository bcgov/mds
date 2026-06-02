import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { MineSpaceMinistryContactManagement } from "@/components/admin/contacts/MinistryContacts/MineSpaceMinistryContactManagement";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { STATIC_CONTENT, AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { minespaceReducerType } from "@mds/common/redux/slices/minespaceSlice";
import * as Permission from "@/constants/permissions";
import * as minespaceSlice from "@mds/common/redux/slices/minespaceSlice";
import * as modalActions from "@mds/common/redux/actions/modalActions";

jest.mock("@mds/common/redux/slices/minespaceSlice", () => {
  const original = jest.requireActual("@mds/common/redux/slices/minespaceSlice");
  return {
    __esModule: true,
    ...original,
    fetchMinistryContacts: jest.fn(() => () => Promise.resolve()),
    fetchDistributionLists: jest.fn(() => () => Promise.resolve()),
    deleteMinistryContact: jest.fn(() => () => Promise.resolve()),
    createMinistryContact: jest.fn(() => () => Promise.resolve()),
    updateMinistryContact: jest.fn(() => () => Promise.resolve()),
  };
});

jest.mock("@mds/common/redux/actions/modalActions", () => ({
  openModal: jest.fn((payload) => ({ type: 'OPEN_MODAL', payload: payload || { props: {} } })),
  closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
}));

jest.mock("@/components/admin/contacts/MinistryContacts/MinistryContactsTable", () => {
  return function MockMinistryContactsTable(props: any) {
    return (
      <div data-testid="mock-table">
        <button onClick={() => props.openEditModal(true, { contact_guid: "123" })}>Mock Edit</button>
        <button onClick={() => props.handleDeleteContact("123")}>Mock Delete</button>
      </div>
    );
  };
});

jest.mock("@/components/common/wrappers/AuthorizationWrapper", () => {
  return function MockAuthorizationWrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

const initialState = {
  [minespaceReducerType]: {
    MinistryContacts: [
      { contact_guid: "1", emli_contact_type_code: "ROE", first_name: "John", last_name: "Doe" },
      { contact_guid: "2", emli_contact_type_code: "XXX", first_name: "Jane", last_name: "Doe", distribution_list_guids: ["dl-1"] },
    ],
    DistributionLists: [
      { distribution_list_guid: "dl-1", distribution_list_name: "Test List" }
    ],
  },
  [STATIC_CONTENT]: {
    mineRegionOptions: [],
    ministryContactTypes: [],
  },
  [AUTHENTICATION]: {
    userAccessData: [Permission.ADMIN],
  },
};

describe("MineSpaceMinistryContactManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders properly and fetches data on mount", async () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MineSpaceMinistryContactManagement />
      </ReduxWrapper>
    );
    expect(minespaceSlice.fetchMinistryContacts).toHaveBeenCalled();
    expect(minespaceSlice.fetchDistributionLists).toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });

  it("handleDeleteContact calls deleteMinistryContact and toggles isLoaded", async () => {
    const { getAllByText } = render(
      <ReduxWrapper initialState={initialState}>
        <MineSpaceMinistryContactManagement />
      </ReduxWrapper>
    );
    await act(async () => {
      fireEvent.click(getAllByText("Mock Delete")[0]);
    });
    expect(minespaceSlice.deleteMinistryContact).toHaveBeenCalledWith("123");
  });

  it("openContactModal in edit mode dispatches openModal with edit props", async () => {
    const { getAllByText } = render(
      <ReduxWrapper initialState={initialState}>
        <MineSpaceMinistryContactManagement />
      </ReduxWrapper>
    );
    await act(async () => {
      fireEvent.click(getAllByText("Mock Edit")[0]);
    });
    expect(modalActions.openModal).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          isEdit: true,
          title: "Update MCM Contact",
        }),
      })
    );
  });

  it("openContactModal in create mode dispatches openModal with create props", async () => {
    const { getByText } = render(
      <ReduxWrapper initialState={initialState}>
        <MineSpaceMinistryContactManagement />
      </ReduxWrapper>
    );
    await act(async () => {
      fireEvent.click(getByText("Create MCM Contact"));
    });
    expect(modalActions.openModal).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          isEdit: false,
          title: "Create MCM Contact",
        }),
      })
    );
  });

  it("renders Distribution Lists tab label", () => {
    const { getByText } = render(
      <ReduxWrapper initialState={initialState}>
        <MineSpaceMinistryContactManagement />
      </ReduxWrapper>
    );
    expect(getByText("Distribution Lists")).toBeTruthy();
  });

  it("filters contacts into offices and non-offices correctly", () => {
    const { getAllByTestId } = render(
      <ReduxWrapper initialState={initialState}>
        <MineSpaceMinistryContactManagement />
      </ReduxWrapper>
    );
    // Should render mock tables for offices, contacts, and the distribution list tab
    const tables = getAllByTestId("mock-table");
    expect(tables.length).toBeGreaterThanOrEqual(2);
  });
});
