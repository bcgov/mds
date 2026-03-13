import React from "react";
import { render } from "@testing-library/react";
import { EditFullPartyForm } from "@/components/Forms/parties/EditFullPartyForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as selectors from "@mds/common/redux/selectors/authenticationSelectors";
import * as formSelectors from "@mds/common/components/forms/form";


jest.spyOn(selectors, "userHasRole").mockImplementation(
  () => (() => true) as any
);
jest.spyOn(formSelectors, "getFormValues").mockReturnValue({
  set_to_inspector: true,
  set_to_project_lead: false,
  set_to_consultation_advisor: true,
} as any);

describe("EditFullPartyForm", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <EditFullPartyForm
          onSubmit={jest.fn()}
          initialValues={{}}
          party={MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]]}
        />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders role assignment section for person", () => {
    const party = {
      ...MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]],
      party_type_code: "PER",
    };

    const { getByText } = render(
      <ReduxWrapper>
        <EditFullPartyForm onSubmit={jest.fn()} initialValues={{}} party={party} />
      </ReduxWrapper>
    );

    expect(getByText("ROLE ASSIGNMENTS")).toBeInTheDocument();
  });

  it("renders role checkboxes", () => {
    const party = {
      ...MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]],
      party_type_code: "PER",
    };

    const { getByLabelText } = render(
      <ReduxWrapper>
        <EditFullPartyForm onSubmit={jest.fn()} initialValues={{}} party={party} />
      </ReduxWrapper>
    );

    expect(getByLabelText(/Inspector/i)).toBeInTheDocument();
    expect(getByLabelText(/Consultation Advisor/i)).toBeInTheDocument();
    expect(getByLabelText(/Project Lead/i)).toBeInTheDocument();
  });

  it("shows consultation advisor date fields when consultation advisor role is enabled", () => {
    const party = {
      ...MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]],
      party_type_code: "PER",
    };

    const { getAllByPlaceholderText } = render(
      <ReduxWrapper>
        <EditFullPartyForm
          onSubmit={jest.fn()}
          initialValues={{}}
          party={party}
        />
      </ReduxWrapper>
    );

    expect(getAllByPlaceholderText("yyyy-mm-dd").length).toBeGreaterThan(0);
  });
});
