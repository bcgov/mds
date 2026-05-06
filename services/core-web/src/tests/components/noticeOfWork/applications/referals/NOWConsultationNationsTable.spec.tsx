import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOWConsultationNationsTable } from "@/components/noticeOfWork/applications/referals/NOWConsultationNationsTable";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const initialState = {
    [NOTICE_OF_WORK]: {
        noticeOfWork: { application_type_code: "NOW" },
        applicationDelays: [],
        noticeOfWorkNations: [],
        noticeOfWorkList: [],
        originalNoticeOfWork: {},
        noticeOfWorkPageData: {},
        noticeOfWorkReviews: [],
        documentDownloadState: { downloading: false, currentFile: 1, totalFiles: 1 },
        pipConsultationData: [],
    },
};

const props = {
    nations: NOW_MOCK.NOW_APPLICATION_NATION_RESPONSE.records as any,
    isLoaded: true,
    expandedRowKeys: [],
    onExpand: jest.fn(),
    openAddNationEventModal: jest.fn(),
    handleDeleteNation: jest.fn(),
    userCanManageConsultationAdvisor: true,
};

describe("NOWConsultationNationsTable", () => {
    it("renders properly", () => {
        const { container: component } = render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <NOWConsultationNationsTable {...props} />
                </ReduxWrapper>
            </BrowserRouter>
        );

        expect(component).toMatchSnapshot();
    });

    it("renders properly without manage consultation advisor permission", () => {
        const { container: component } = render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <NOWConsultationNationsTable
                        {...props}
                        userCanManageConsultationAdvisor={false}
                    />
                </ReduxWrapper>
            </BrowserRouter>
        );

        expect(component).toMatchSnapshot();
    });

    it("renders nation name in the table", () => {
        render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <NOWConsultationNationsTable {...props} />
                </ReduxWrapper>
            </BrowserRouter>
        );

        expect(screen.getByText("Organization 1")).toBeInTheDocument();
    });

    it("renders 'Yes' for consultation_started_by_client when true", () => {
        render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <NOWConsultationNationsTable {...props} />
                </ReduxWrapper>
            </BrowserRouter>
        );

        expect(screen.getByText("Yes")).toBeInTheDocument();
    });

    it("renders 'No' for consultation_started_by_client when false", () => {
        const nationWithClientFalse = [
            {
                ...NOW_MOCK.NOW_APPLICATION_NATION_RESPONSE.records[0],
                consultation_started_by_client: false,
            },
        ] as any;

        render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <NOWConsultationNationsTable
                        {...props}
                        nations={nationWithClientFalse}
                    />
                </ReduxWrapper>
            </BrowserRouter>
        );

        expect(screen.getByText("No")).toBeInTheDocument();
    });

    it("renders empty state when nations list is empty", () => {
        render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <NOWConsultationNationsTable
                        {...props}
                        nations={[]}
                    />
                </ReduxWrapper>
            </BrowserRouter>
        );

        // Table header columns should still render
        expect(screen.getByText("Nation/Consultation Stream")).toBeInTheDocument();
    });

    it("does not render actions column when user lacks manage consultation advisor permission", () => {
        const { container } = render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <NOWConsultationNationsTable
                        {...props}
                        userCanManageConsultationAdvisor={false}
                    />
                </ReduxWrapper>
            </BrowserRouter>
        );

        expect(container.querySelector(".ant-dropdown-trigger")).not.toBeInTheDocument();
    });
});