import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpdateNOWTierForm } from "@/components/Forms/noticeOfWork/UpdateNOWTierForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";

jest.mock("antd", () => {
    const actual = jest.requireActual("antd");
    const Popconfirm = ({ onConfirm, children }: any) => (
        <div data-testid="popconfirm-mock" onClick={onConfirm}>
            {children}
        </div>
    );
    return { ...actual, Popconfirm };
});

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

const initialState = {
    [STATIC_CONTENT]: {
      noticeOfWorkTierOptions: [
          { notice_of_work_tier_code: "1", description: "Tier 1", display_order: 1 }
      ],
    }
};

describe("UpdateNOWTierForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders properly", () => {
        const { container: component } = render(
            <ReduxWrapper initialState={initialState}>
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
        render(
            <ReduxWrapper initialState={initialState}>
                <UpdateNOWTierForm {...explorationProps} {...dispatchProps} />
            </ReduxWrapper>
        );
        expect(
            screen.getByText("Tier selection is required for Mineral or Coal exploration applications.")
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
        render(
            <ReduxWrapper initialState={initialState}>
                <UpdateNOWTierForm {...nonExplorationProps} {...dispatchProps} />
            </ReduxWrapper>
        );
        expect(
            screen.queryByText("Tier selection is required for Mineral or Coal exploration applications.")
        ).not.toBeInTheDocument();
    });

    it("displays (initial intake) when created and updated dates are equal", () => {
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
                <UpdateNOWTierForm {...initialIntakeProps} {...dispatchProps} />
            </ReduxWrapper>
        );
        expect(screen.getByText((content) => content.includes("Tier Category") && content.includes("(initial intake)"))).toBeInTheDocument();
    });

    it("calls onCancel when cancel button is clicked and onConfirm is triggered", async () => {
        const onCancel = jest.fn();
        const cancelProps = { ...props, onCancel };
        render(
            <ReduxWrapper initialState={initialState}>
                <UpdateNOWTierForm {...cancelProps} {...dispatchProps} />
            </ReduxWrapper>
        );
        const cancelBtn = screen.getByText("Cancel");
        await userEvent.click(cancelBtn);
        expect(onCancel).toHaveBeenCalled();
    });

    it("calls closeModal when cancel button is clicked and onCancel is not provided", async () => {
        const cancelProps = { ...props, onCancel: undefined };
        render(
            <ReduxWrapper initialState={initialState}>
                <UpdateNOWTierForm {...cancelProps} {...dispatchProps} />
            </ReduxWrapper>
        );
        const cancelBtn = screen.getByText("Cancel");
        await userEvent.click(cancelBtn);
        expect(dispatchProps.closeModal).toHaveBeenCalled();
    });
});
