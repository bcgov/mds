import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import PermitTemplateConditionManager from "@mds/common/components/permits/PermitTemplateConditionManager";
import { PermitConditionsProvider } from "@mds/common/components/permits/PermitConditionsContext";
import { PERMITS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import userEvent from "@testing-library/user-event";

const category = {
  href: "GEC",
  condition_category: {
    description: "General Conditions",
    step: "A.",
  },
  conditions: [],
  condition_category_code: "GEC",
  title: <p>"Geotechnical Conditions"</p>,
  step: "1",
  description: "General Conditions",
};

const initialState = {
  [STATIC_CONTENT]: {
    ...MOCK.BULK_STATIC_CONTENT_RESPONSE,
  },
  [PERMITS]: {
    standardPermitConditions: MOCK.STANDARD_PERMIT_CONDITIONS,
  },
};

const providerParams = {
  mineGuid: "mineGuid",
  permitGuid: "permitGuid",
  latestAmendment: null,
  previousAmendment: null,
  currentAmendment: null,
  loading: false,
  setLoading: jest.fn(),
  refreshData: jest.fn(),
};

describe("PermitTemplateConditionManager", () => {
  it("renders the list of template conditions", async () => {
    const { container, getByTestId, findByTestId } = render(
      <ReduxWrapper initialState={initialState}>
        <PermitConditionsProvider value={providerParams}>
          <PermitTemplateConditionManager
            category={category}
            typeCode="GEC"
            onInsert={jest.fn()}
            onClose={jest.fn()}
            permitAmendmentGuid="permit-amendment-guid"
          />
        </PermitConditionsProvider>
      </ReduxWrapper>
    );

    const templateManager = await findByTestId("permit-condition-template-manager");
    expect(templateManager).toMatchSnapshot();
  });

  it("shows message when no template conditions are available", () => {
    const emptyState = {};

    const { getByText } = render(
      <ReduxWrapper initialState={emptyState}>
        <PermitConditionsProvider value={providerParams}>
          <PermitTemplateConditionManager
            category={category}
            typeCode="GEC"
            onInsert={jest.fn()}
            onClose={jest.fn()}
            permitAmendmentGuid="permit-amendment-guid"
          />
        </PermitConditionsProvider>
      </ReduxWrapper>
    );

    expect(getByText("No template conditions available for this category.")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onCloseMock = jest.fn();

    const { findByTestId } = render(
      <ReduxWrapper initialState={initialState}>
        <PermitConditionsProvider value={providerParams}>
          <PermitTemplateConditionManager
            category={category}
            typeCode="GEC"
            onInsert={jest.fn()}
            onClose={onCloseMock}
            permitAmendmentGuid="permit-amendment-guid"
          />
        </PermitConditionsProvider>
      </ReduxWrapper>
    );

    const user = userEvent.setup();
    const templateConditions = await findByTestId("permit-condition-template-manager");
    expect(templateConditions).toBeInTheDocument();

    const closeButton = await findByTestId("close-template-manager-button");
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it("inserts a condition when Insert Condition button is clicked", async () => {
    const onInsertMock = jest.fn();

    const { findAllByTestId } = render(
      <ReduxWrapper initialState={initialState}>
        <PermitConditionsProvider value={providerParams}>
          <PermitTemplateConditionManager
            category={category}
            typeCode="GEC"
            onInsert={onInsertMock}
            onClose={jest.fn()}
            permitAmendmentGuid="permit-amendment-guid"
          />
        </PermitConditionsProvider>
      </ReduxWrapper>
    );

    const user = userEvent.setup();

    const insertButtons = await findAllByTestId("template-insert-button");
    await user.click(insertButtons[0]);

    expect(onInsertMock).toHaveBeenCalled();
  });

  it("renders sub-conditions when they exist", async () => {
    const { findAllByTestId, findByText, queryByText } = render(
      <ReduxWrapper initialState={initialState}>
        <PermitConditionsProvider value={providerParams}>
          <PermitTemplateConditionManager
            category={category}
            typeCode="GEC"
            onInsert={jest.fn()}
            onClose={jest.fn()}
            permitAmendmentGuid="permit-amendment-guid"
          />
        </PermitConditionsProvider>
      </ReduxWrapper>
    );

    const user = userEvent.setup();
    const conditions = await findAllByTestId("template-conditions-collapse");

    expect(queryByText(/Approved Activities:/)).not.toBeInTheDocument();

    await user.click(conditions[0]);

    expect(await findByText("Sub Conditions:")).toBeInTheDocument();
    expect(await findByText(/Approved Activities:/)).toBeInTheDocument();
  });
});
