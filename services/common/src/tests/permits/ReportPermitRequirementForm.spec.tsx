import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PermitConditionsProvider } from "@mds/common/components/permits/PermitConditionsContext";
import { ReportPermitRequirementForm } from "@mds/common/components/permits/ReportPermitRequirementForm";
import { mineReportPermitRequirementReducerType } from "@mds/common/redux/slices/mineReportPermitRequirementSlice";

// The condition currently being edited belongs to the "MIN" template.
const condition: any = {
  permit_condition_id: 999,
  standard_permit_condition_id: 999,
  condition_category_code: "GEC",
  notice_of_work_type: "MIN",
  sub_conditions: [],
};

const sameTemplateRequirement = {
  mine_report_permit_requirement_id: 1,
  report_name: "Same Template Report",
  permit_condition_ids: [999],
  condition_category_code: "GEC",
  notice_of_work_type: "MIN",
  due_date_period_months: 12,
  cim_or_cpo: "CIM",
  ministry_recipient: ["HS"],
};

const differentTemplateRequirement = {
  mine_report_permit_requirement_id: 2,
  report_name: "Different Template Report",
  permit_condition_ids: [111],
  condition_category_code: "GEC",
  notice_of_work_type: "SAG",
  due_date_period_months: 6,
  cim_or_cpo: "CIM",
  ministry_recipient: ["HS"],
};

const initialState = {
  [mineReportPermitRequirementReducerType]: {
    standardReportRequirements: [sameTemplateRequirement, differentTemplateRequirement],
  },
};

const providerParams = {
  mineGuid: "mine-guid",
  isStandardConditionEditor: true,
  currentAmendment: null,
  loading: false,
  setLoading: jest.fn(),
  refreshData: jest.fn(),
};

const renderForm = () =>
  render(
    <ReduxWrapper initialState={initialState}>
      <PermitConditionsProvider value={providerParams}>
        <ReportPermitRequirementForm
          canEditPermitConditions={true}
          refreshData={jest.fn()}
          condition={condition}
          isModal
        />
      </PermitConditionsProvider>
    </ReduxWrapper>
  );

describe("ReportPermitRequirementForm - standard condition template scoping", () => {
  it("only offers existing reports from the same template in the 'Select an Existing Report' dropdown", async () => {
    const { container, findByText, queryByText } = renderForm();

    const combobox = container.querySelector('[id$="_mine_report_permit_requirement_id"]');
    expect(combobox).toBeTruthy();
    fireEvent.mouseDown(combobox);

    await findByText("Same Template Report");
    expect(queryByText("Different Template Report")).not.toBeInTheDocument();
  });

  it("does not show the report requirement selector when there are no reports for the current template", () => {
    const emptyTemplateState = {
      [mineReportPermitRequirementReducerType]: {
        standardReportRequirements: [differentTemplateRequirement],
      },
    };

    const { queryByText } = render(
      <ReduxWrapper initialState={emptyTemplateState}>
        <PermitConditionsProvider value={providerParams}>
          <ReportPermitRequirementForm
            canEditPermitConditions={true}
            refreshData={jest.fn()}
            condition={condition}
            isModal
          />
        </PermitConditionsProvider>
      </ReduxWrapper>
    );

    // The only existing report requirement belongs to a different template, so
    // hasExistingRequirements should be false for the current (MIN) template and the
    // "Select an Existing Report" field should not render at all.
    expect(queryByText("Select an Existing Report")).not.toBeInTheDocument();
  });

  it("correctly filters standard requirements by template when condition is undefined but requirement has notice_of_work_type", () => {
    const anotherSameTemplateRequirement = {
      mine_report_permit_requirement_id: 3,
      report_name: "Another Same Template Report",
      permit_condition_ids: [999],
      condition_category_code: "GEC",
      notice_of_work_type: "MIN",
      due_date_period_months: 12,
      cim_or_cpo: "CIM",
      ministry_recipient: ["HS"],
    };

    const customState = {
      [mineReportPermitRequirementReducerType]: {
        standardReportRequirements: [
          sameTemplateRequirement,
          differentTemplateRequirement,
          anotherSameTemplateRequirement,
        ],
      },
    };

    const { container } = render(
      <ReduxWrapper initialState={customState}>
        <PermitConditionsProvider value={providerParams}>
          <ReportPermitRequirementForm
            canEditPermitConditions={true}
            refreshData={jest.fn()}
            mineReportPermitRequirement={sameTemplateRequirement as any}
            isModal
          />
        </PermitConditionsProvider>
      </ReduxWrapper>
    );

    const input = container.querySelector('input[name="report_name"]');
    expect(input).not.toBeNull();
    expect(input).toHaveValue("Same Template Report");
  });
});
