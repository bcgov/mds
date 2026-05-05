import React from "react";
import { render } from "@testing-library/react";
import { Consultation } from "@/components/noticeOfWork/applications/referals/Consultation";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn().mockReturnValue({ id: "now-application-guid" }),
}));

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
    useFeatureFlag: jest.fn().mockReturnValue({
        isFeatureEnabled: jest.fn().mockReturnValue(true),
    }),
}));

jest.mock("@mds/common/redux/rootState", () => ({
    useAppDispatch: jest.fn(() => jest.fn(() => Promise.resolve())),
    useAppSelector: jest.fn((selector) => selector({})),
}));

jest.mock("@mds/common/redux/selectors/authenticationSelectors", () => ({
    userHasRole: jest.fn(() => true),
}));

jest.mock("@mds/common/redux/selectors/staticContentSelectors", () => ({
    getDropdownNoticeOfWorkNationEventOptions: jest.fn(() => [
        { label: "Information sent", value: "INS" },
        { label: "Information received", value: "INR" },
    ]),
}));

jest.mock("@mds/common/redux/selectors/noticeOfWorkSelectors", () => ({
    getPipConsultationData: jest.fn(() => [
        {
            internal_mds_id: 1,
            contact_organization_name: "Test Nation",
            organization_guid: "organization-guid",
            cnsltn_area_name: "Consultation Area",
            cnsltn_area_guid: "consultation-area-guid",
            cnsltn_area_update_date: "2026-04-30T00:00:00",
        },
    ]),
    getNoticeOfWorkNations: jest.fn(() => [
        {
            key: "nation-guid",
            now_application_nation_guid: "nation-guid",
            contact_organization_name: "Test Nation",
            events: [],
        },
    ]),
}));

jest.mock("@mds/common/redux/actionCreators/noticeOfWorkActionCreator", () => ({
    fetchNoticeOfWorkApplicationNations: jest.fn(() => () => Promise.resolve()),
    createNoticeOfWorkApplicationNation: jest.fn(() => () => Promise.resolve()),
    deleteNoticeOfWorkApplicationNation: jest.fn(() => () => Promise.resolve()),
    createNoticeOfWorkApplicationNationEvent: jest.fn(() => () => Promise.resolve()),
    fetchPipConsultationAreaData: jest.fn(() => () => Promise.resolve()),
}));

jest.mock("@mds/common/redux/actions/modalActions", () => ({
    openModal: jest.fn((payload) => payload),
    closeModal: jest.fn(() => ({ type: "CLOSE_MODAL" })),
}));

const dispatchProps = {
    handleDelete: jest.fn(),
    openEditModal: jest.fn(),
    handleEdit: jest.fn(),
    handleDocumentDelete: jest.fn(),
    openAddReviewModal: jest.fn(),
    handleAddReview: jest.fn(),
};

const reducerProps = {
    noticeOfWorkReviews: [],
    noticeOfWorkReviewTypes: [],
    isLoaded: true,
};

describe("Consultation", () => {
    it("renders properly", () => {
        const { container: component } = render(
            <BrowserRouter>
                <ReduxWrapper>
                    <Consultation {...dispatchProps} {...reducerProps} />
                </ReduxWrapper>
            </BrowserRouter>
        );

        expect(component).toMatchSnapshot();
    });
});