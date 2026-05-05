import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOWConsultationNationsTable } from "@/components/noticeOfWork/applications/referals/NOWConsultationNationsTable";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const initialState = {
    [NOTICE_OF_WORK]: {
        noticeOfWork: { application_type_code: "NOW" },
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
});