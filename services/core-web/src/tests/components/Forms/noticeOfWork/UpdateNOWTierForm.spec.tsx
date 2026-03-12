import React from "react";
import { render } from "@testing-library/react";
import { UpdateNOWTierForm } from "@/components/Forms/noticeOfWork/UpdateNOWTierForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
    onSubmit: jest.fn(),
    closeModal: jest.fn(),
};

const props = {
    title: "Update Tier Category",
    initialValues: {
        now_application_tier_code: "1",
        now_application_tier_description: "Rationale",
    },
    noticeOfWork: {
        mine_region: "SW",
        notice_of_work_type_description: "Mineral",
        lead_inspector_name: "John Doe",
        issuing_inspector_name: "Jane Doe",
        notice_of_work_type_code: "MIN",
    } as any,
};

describe("UpdateNOWTierForm", () => {
    it("renders properly", () => {
        const { container: component } = render(
            <ReduxWrapper>
                <UpdateNOWTierForm {...props} {...dispatchProps} />
            </ReduxWrapper>
        );
        expect(component).toMatchSnapshot();
    });

    it("displays helper text when isExploration is true", () => {
        const explorationProps = {
            ...props,
            noticeOfWork: {
                ...props.noticeOfWork,
                notice_of_work_type_code: "MIN",
            },
        };
        const { getByText } = render(
            <ReduxWrapper>
                <UpdateNOWTierForm {...explorationProps} {...dispatchProps} />
            </ReduxWrapper>
        );
        expect(
            getByText("Tier selection is required for Mineral or Coal exploration applications.")
        ).toBeInTheDocument();
    });

    it("does not display helper text when isExploration is false", () => {
        const nonExplorationProps = {
            ...props,
            noticeOfWork: {
                ...props.noticeOfWork,
                notice_of_work_type_code: "PLP",
            },
        };
        const { queryByText } = render(
            <ReduxWrapper>
                <UpdateNOWTierForm {...nonExplorationProps} {...dispatchProps} />
            </ReduxWrapper>
        );
        expect(
            queryByText("Tier selection is required for Mineral or Coal exploration applications.")
        ).not.toBeInTheDocument();
    });
});
