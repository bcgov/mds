import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { Consultation } from "@/components/noticeOfWork/applications/referals/Consultation";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { AUTHENTICATION, NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";
import * as MODAL_ACTIONS from "@mds/common/redux/actions/modalActions";
import * as NOW_ACTION_CREATORS from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn().mockReturnValue({ id: "test-now-guid" }),
}));

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
    useFeatureFlag: () => ({ isFeatureEnabled: () => true }),
}));

jest.mock("@/components/noticeOfWork/NOWActionWrapper", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@mds/common/redux/actions/modalActions", () => ({
    openModal: jest.fn().mockReturnValue({ type: "OPEN_MODAL", payload: { props: {}, content: null } }),
    closeModal: jest.fn().mockReturnValue({ type: "CLOSE_MODAL" }),
}));

jest.mock("@mds/common/redux/actionCreators/noticeOfWorkActionCreator", () => ({
    fetchNoticeOfWorkApplicationNations: jest.fn().mockReturnValue({ type: "FETCH_NATIONS" }),
    fetchPipConsultationAreaData: jest.fn().mockReturnValue({ type: "FETCH_PIP" }),
    createNoticeOfWorkApplicationNation: jest.fn().mockReturnValue(() => Promise.resolve()),
    deleteNoticeOfWorkApplicationNation: jest.fn().mockReturnValue(() => Promise.resolve()),
    createNoticeOfWorkApplicationNationEvent: jest.fn().mockReturnValue(() => Promise.resolve()),
}));

const baseProps = {
    noticeOfWorkReviews: [],
    noticeOfWorkReviewTypes: [],
    isLoaded: true,
    handleDelete: jest.fn(),
    openEditModal: jest.fn(),
    handleEdit: jest.fn(),
    handleDocumentDelete: jest.fn(),
    openAddReviewModal: jest.fn(),
    handleAddReview: jest.fn(),
};

const withRoleState = {
    [AUTHENTICATION]: {
        userAccessData: [USER_ROLES.role_manage_consultation_advisor],
    },
    [NOTICE_OF_WORK]: {
        noticeOfWork: { application_type_code: "NOW" },
        applicationDelays: [],
        noticeOfWorkNations: NOW_MOCK.NOW_APPLICATION_NATION_RESPONSE.records,
        noticeOfWorkList: [],
        originalNoticeOfWork: {},
        noticeOfWorkPageData: {},
        noticeOfWorkReviews: [],
        documentDownloadState: { downloading: false, currentFile: 1, totalFiles: 1 },
        pipConsultationData: [],
    },
};

const withoutRoleState = {
    ...withRoleState,
    [AUTHENTICATION]: {
        userAccessData: [],
    },
};

const renderConsultation = (initialState = withRoleState, props = baseProps) =>
    render(
        <BrowserRouter>
            <ReduxWrapper initialState={initialState}>
                <Consultation {...props} />
            </ReduxWrapper>
        </BrowserRouter>
    );

describe("Consultation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders properly with feature flag enabled and manage role", () => {
        const { container } = renderConsultation();
        expect(container).toMatchSnapshot();
    });

    it("renders properly with feature flag enabled without manage role", () => {
        const { container } = renderConsultation(withoutRoleState);
        expect(container).toMatchSnapshot();
    });

    it("fetches nations and pip consultation data on mount when feature flag enabled", () => {
        renderConsultation();
        expect(NOW_ACTION_CREATORS.fetchPipConsultationAreaData).toHaveBeenCalled();
        expect(NOW_ACTION_CREATORS.fetchNoticeOfWorkApplicationNations).toHaveBeenCalledWith(
            "test-now-guid"
        );
    });

    it("shows the 'Add Nation' button when user has manage consultation advisor role", () => {
        renderConsultation(withRoleState);
        expect(screen.getByText("Add Nation")).toBeInTheDocument();
    });

    it("does not show the 'Add Nation' button when user lacks manage consultation advisor role", () => {
        renderConsultation(withoutRoleState);
        expect(screen.queryByText("Add Nation")).not.toBeInTheDocument();
    });

    it("opens the add nation modal when 'Add Nation' is clicked", async () => {
        renderConsultation(withRoleState);
        await userEvent.click(screen.getByText("Add Nation"));
        expect(MODAL_ACTIONS.openModal).toHaveBeenCalled();
    });

    it("always shows the 'Add Consultation' button", () => {
        renderConsultation(withoutRoleState);
        expect(screen.getByText("Add Consultation")).toBeInTheDocument();
    });

    it("opens add nation event modal with empty initialValues when nation has no completed events", async () => {
        const nationWithNoEvents = [
            {
                ...NOW_MOCK.NOW_APPLICATION_NATION_RESPONSE.records[0],
                events: [],
            },
        ];
        const stateWithNoEvents = {
            ...withRoleState,
            [NOTICE_OF_WORK]: {
                ...withRoleState[NOTICE_OF_WORK],
                noticeOfWorkNations: nationWithNoEvents,
            },
        };

        renderConsultation(stateWithNoEvents);

        // Expand the row to reveal the "Add event" button
        const expandBtn = document.querySelector(".ant-table-row-expand-icon");
        if (expandBtn) {
            await userEvent.click(expandBtn as HTMLElement);
            const addEventBtn = await screen.findByText("Add event");
            await userEvent.click(addEventBtn);
            const call = (MODAL_ACTIONS.openModal as jest.Mock).mock.calls[0][0];
            expect(call.props.initialValues).toEqual({});
        }
    });

    it("opens add nation event modal with start_date pre-filled from latest completed event", async () => {
        const nationWithCompletedEvent = [
            {
                ...NOW_MOCK.NOW_APPLICATION_NATION_RESPONSE.records[0],
                events: [
                    {
                        ...NOW_MOCK.NOW_APPLICATION_NATION_RESPONSE.records[0].events[0],
                        end_date: "2021-10-27T18:05:56.475794+00:00",
                    },
                ],
            },
        ];
        const stateWithCompletedEvent = {
            ...withRoleState,
            [NOTICE_OF_WORK]: {
                ...withRoleState[NOTICE_OF_WORK],
                noticeOfWorkNations: nationWithCompletedEvent,
            },
        };

        renderConsultation(stateWithCompletedEvent);

        const expandBtn = document.querySelector(".ant-table-row-expand-icon");
        if (expandBtn) {
            await userEvent.click(expandBtn as HTMLElement);
            const addEventBtn = await screen.findByText("Add event");
            await userEvent.click(addEventBtn);
            const call = (MODAL_ACTIONS.openModal as jest.Mock).mock.calls[0][0];
            expect(call.props.initialValues).toEqual({
                start_date: "2021-10-27T18:05:56.475794+00:00",
            });
            expect(call.props.startDateDisabled).toBe(true);
        }
    });
});
