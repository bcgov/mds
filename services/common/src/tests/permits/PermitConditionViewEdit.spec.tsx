import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { PERMITS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import PermitConditionViewEdit from "@mds/common/components/permits/PermitConditionViewEdit";
import { PermitConditionsProvider } from "@mds/common/components/permits/PermitConditionsContext";
import { FORM } from "@mds/common/constants/forms";
import { Feature } from "@mds/common/utils/featureFlag";

// We will mock the feature flag hook so we can toggle features deterministically
jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
    useFeatureFlag: () => ({
        isFeatureEnabled: (f: Feature) => {
            // Always enable modify permit conditions so tests focus on component logic
            if (f === Feature.MODIFY_PERMIT_CONDITIONS) return true;
            if (f === Feature.PERMIT_CONDITION_TAGS) return true;
            return true;
        }
    })
}));

// Minimal formatted categories derived from mocks (reuse first amendment category + first condition)
const amendment = MOCK.PERMITS[0].permit_amendments[0];
const baseCategory = amendment.condition_categories[0];
const firstCondition = amendment.conditions.find(c => c.condition_category_code === baseCategory.condition_category_code);

// IMPORTANT: condition_category must include condition_category_code for permission logic
const formattedCategories = [
    {
        href: baseCategory.condition_category_code,
        condition_category: {
            condition_category_code: baseCategory.condition_category_code,
            description: baseCategory.description,
            step: baseCategory.step,
            display_order: baseCategory.display_order ?? 0,
        },
        conditions: [firstCondition],
        condition_category_code: baseCategory.condition_category_code,
        step: baseCategory.step,
        description: baseCategory.description,
        title: `${baseCategory.step} ${baseCategory.description}`,
    }
];

const initialState = {
    [PERMITS]: {
        permits: MOCK.PERMITS,
        latestPermitAmendments: { [MOCK.PERMITS[0].permit_guid]: amendment },
        permitConditionTags: MOCK.PERMIT_CONDITION_TAGS,
    },
    [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
};

const providerValue = {
    mineGuid: MOCK.PERMITS[0].mine_guid,
    permitGuid: MOCK.PERMITS[0].permit_guid,
    currentAmendment: amendment,
    latestAmendment: amendment,
    previousAmendment: MOCK.PERMITS[0].permit_amendments[1],
    loading: false,
    setLoading: jest.fn(),
    refreshData: jest.fn().mockResolvedValue(undefined),
    isStandardConditionEditor: false,
    isNowEditor: false,
};

describe("PermitConditionViewEdit", () => {
    it("renders category and condition with edit controls enabled when userCanEdit + review assignment", () => {
        const setEditingFormName = jest.fn();
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider value={providerValue}>
                    <PermitConditionViewEdit
                        userCanEdit
                        formattedCategories={formattedCategories as any}
                        isExtracted
                        userReviewCategoryCodes={[baseCategory.condition_category_code]}
                        editingFormName={""}
                        setEditingFormName={setEditingFormName}
                        addingToCategoryCode={null}
                        setAddingToCategoryCode={jest.fn()}
                    />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        // Add Condition button visible
        expect(screen.getByText("Add Condition")).toBeInTheDocument();

        // Category inline edit (title has aria button with title 'Click to edit')
        const editCategory = container.querySelector('[data-title="Click to edit"]');
        expect(editCategory).toBeInTheDocument();

        // Condition edit button has aria-label starting with Edit Condition
        const editConditionButton = container.querySelector('[aria-label^="Edit Condition"]');
        expect(editConditionButton).toBeInTheDocument();
    });

    it("hides edit actions when user cannot edit or not assigned", () => {
        render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider value={providerValue}>
                    <PermitConditionViewEdit
                        userCanEdit={false}
                        formattedCategories={formattedCategories as any}
                        isExtracted
                        userReviewCategoryCodes={[]}
                        editingFormName={""}
                        setEditingFormName={jest.fn()}
                        addingToCategoryCode={null}
                        setAddingToCategoryCode={jest.fn()}
                    />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        expect(screen.queryByText("Add Condition")).not.toBeInTheDocument();
        expect(screen.queryByTitle("Click to edit")).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Edit Condition/)).not.toBeInTheDocument();
    });

    it("allows clicking Add Condition to show SubConditionForm (identified by Cancel button)", async () => {
        const { rerender } = render(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider value={providerValue}>
                    <PermitConditionViewEdit
                        userCanEdit
                        formattedCategories={formattedCategories as any}
                        isExtracted
                        userReviewCategoryCodes={[baseCategory.condition_category_code]}
                        editingFormName={""}
                        setEditingFormName={jest.fn()}
                        addingToCategoryCode={null}
                        setAddingToCategoryCode={jest.fn()}
                    />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        fireEvent.click(screen.getByText("Add Condition"));

        rerender(
            <ReduxWrapper initialState={initialState}>
                <PermitConditionsProvider value={providerValue}>
                    <PermitConditionViewEdit
                        userCanEdit
                        formattedCategories={formattedCategories as any}
                        isExtracted
                        userReviewCategoryCodes={[baseCategory.condition_category_code]}
                        editingFormName={FORM.EDIT_PERMIT_CONDITION}
                        setEditingFormName={jest.fn()}
                        addingToCategoryCode={baseCategory.condition_category_code}
                        setAddingToCategoryCode={jest.fn()}
                    />
                </PermitConditionsProvider>
            </ReduxWrapper>
        );

        await waitFor(() => {
            expect(screen.getByLabelText('Cancel')).toBeInTheDocument();
        });
    });
});
