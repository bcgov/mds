import React from "react";
import { render, screen } from "@testing-library/react";
import { NoticeOfWorkPageHeader } from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import userEvent from "@testing-library/user-event";
import * as MODAL_ACTIONS from "@mds/common/redux/actions/modalActions";
import { STATIC_CONTENT, AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";

jest.mock("@mds/common/redux/actions/modalActions", () => ({
  openModal: jest.fn().mockReturnValue({ type: "OPEN_MODAL", payload: { props: {}, content: null } }),
  closeModal: jest.fn().mockReturnValue({ type: "CLOSE_MODAL" }),
}));

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({ isFeatureEnabled: () => true }),
}));

const noticeOfWork = {
    ...NOW_MOCK.NOTICE_OF_WORK,
    application_type_code: "NOW",
    now_number: "1234567-89",
    notice_of_work_type_code: "MIN",
    now_application_tier_code: "1",
    imported_to_core: true,
} as any;

const props = {
  noticeOfWork,
  applicationPageFromRoute: { title: "Mock Title", route: "mock/url" },
  fixedTop: false,
};

const initialState = {
  [STATIC_CONTENT]: {
    noticeOfWorkTierOptions: [
        { notice_of_work_tier_code: "1", description: "Tier 1", display_order: 1 }
    ],
    noticeOfWorkApplicationStatusOptions: []
  },
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_edit_permits]
  }
};

describe("NoticeOfWorkPageHeader", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <NoticeOfWorkPageHeader {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
    expect(screen.queryByText(/Timeline Tier:/i)).toBeInTheDocument();
  });

  it("renders Tier Category and (initial intake) label", () => {
    const initialIntakeProps = {
      ...props,
      noticeOfWork: {
        ...props.noticeOfWork,
        now_application_tier_created_date: "2023-01-01",
        now_application_tier_updated_date: "2023-01-01",
      },
    };
    render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <NoticeOfWorkPageHeader {...initialIntakeProps} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(screen.getByText(/Timeline Tier:/i)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("Tier 1") && content.includes("(initial intake)"))).toBeInTheDocument();
  });

  it("opens UpdateTierModal when edit button is clicked", async () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <NoticeOfWorkPageHeader {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    const editBtn = screen.getByTitle("Edit");
    await userEvent.click(editBtn);
    expect(MODAL_ACTIONS.openModal).toHaveBeenCalled();
  });

  it("opens TierHistoryModal when history button is clicked", async () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <NoticeOfWorkPageHeader {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    const historyBtn = screen.getByTitle("History");
    await userEvent.click(historyBtn);
    expect(MODAL_ACTIONS.openModal).toHaveBeenCalled();
  });
});
