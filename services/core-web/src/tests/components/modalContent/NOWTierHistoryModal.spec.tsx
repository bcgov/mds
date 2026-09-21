import React from "react";
import { render, screen } from "@testing-library/react";
import { NOWTierHistoryModal } from "@/components/modalContent/NOWTierHistoryModal";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as NOW_ACTIONS from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";

jest.mock("@mds/common/redux/actionCreators/noticeOfWorkActionCreator", () => ({
  fetchNoticeOfWorkApplicationTierHistory: jest.fn(),
}));

const initialState = {
  [STATIC_CONTENT]: {
    noticeOfWorkTierOptions: [
      { notice_of_work_tier_code: "1", description: "Tier 1", display_order: 1 },
      { notice_of_work_tier_code: "2", description: "Tier 2", display_order: 1 },
    ],
  },
};

const historyData = [
  {
    updated_by: "User 1",
    updated_at: "2023-01-01T12:00:00Z",
    changeset: [
      { field_name: "notice_of_work_tier_code", from: null, to: "1" }
    ],
  },
];

const props = {
  closeModal: jest.fn(),
  applicationGuid: "abc-123",
};

describe("NOWTierHistoryModal", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

  it("renders properly with history data", async () => {
    (NOW_ACTIONS.fetchNoticeOfWorkApplicationTierHistory as jest.Mock).mockReturnValue(() =>
      Promise.resolve({ data: historyData })
    );

    render(
      <ReduxWrapper initialState={initialState}>
        <NOWTierHistoryModal {...props} />
      </ReduxWrapper>
    );

    expect(await screen.findByText("User 1")).toBeInTheDocument();
    expect(await screen.findByText(/Changed from N\/A to Tier 1 \(initial intake\)/)).toBeInTheDocument();
  });

  it("renders properly with empty history", async () => {
    (NOW_ACTIONS.fetchNoticeOfWorkApplicationTierHistory as jest.Mock).mockReturnValue(() =>
      Promise.resolve({ data: [] })
    );

    render(
      <ReduxWrapper initialState={initialState}>
        <NOWTierHistoryModal {...props} />
      </ReduxWrapper>
    );

    expect(await screen.findByText("No history found for this application.")).toBeInTheDocument();
  });

  it("renders properly with no tier change in changeset", async () => {
    const noTierChangeHistory = [
      {
        updated_by: "User 2",
        updated_at: "2023-01-02T12:00:00Z",
        changeset: [{ field_name: "other_field", from: "a", to: "b" }],
      },
    ];
    (NOW_ACTIONS.fetchNoticeOfWorkApplicationTierHistory as jest.Mock).mockReturnValue(() =>
      Promise.resolve({ data: noTierChangeHistory })
    );

    render(
      <ReduxWrapper initialState={initialState}>
        <NOWTierHistoryModal {...props} />
      </ReduxWrapper>
    );

    expect(await screen.findByText("No tier change recorded")).toBeInTheDocument();
  });

  it("renders properly with only description change", async () => {
    const descriptionChangeHistory = [
      {
        updated_by: "User 3",
        updated_at: "2023-01-03T12:00:00Z",
        changeset: [{ field_name: "description", from: "old", to: "new rationale" }],
      },
    ];
    (NOW_ACTIONS.fetchNoticeOfWorkApplicationTierHistory as jest.Mock).mockReturnValue(() =>
      Promise.resolve({ data: descriptionChangeHistory })
    );

    render(
      <ReduxWrapper initialState={initialState}>
        <NOWTierHistoryModal {...props} />
      </ReduxWrapper>
    );

    expect(await screen.findByText("Rationale updated")).toBeInTheDocument();
    expect(await screen.findByText("new rationale")).toBeInTheDocument();
  });
});
