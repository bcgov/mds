import React from "react";
import { render } from "@testing-library/react";
import Contact from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/App";

const props = {
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
  partyRelationship: MOCK.PARTYRELATIONSHIPS[0],
  partyRelationshipTitle: "Permittee",
  permits: MOCK.PERMITS,
  otherDetails: "other details",
  isEditable: false,
  compact: false,
};

const renderContext = (allProps) =>
  render(
    <Provider store={store}>
      <BrowserRouter>
        <Contact {...allProps} />
      </BrowserRouter>
    </Provider>
  );

describe("Contact", () => {
  it("renders properly", () => {
    const { container: component } = renderContext(props);
    expect(component).toMatchSnapshot();
  });

  it("displays the permit number in the subtitle when mine_party_appt_type_code is 'PMT'", () => {
    const partyRelationship = {
      ...MOCK.PARTYRELATIONSHIPS[0],
      mine_party_appt_type_code: "PMT",
      related_guid: MOCK.PERMITS[0].permit_guid,
    };
    const { getByText } = renderContext({ ...props, partyRelationship });
    expect(getByText(`(${MOCK.PERMITS[0].permit_no})`)).toBeInTheDocument();
  });

  it("displays 'No permit assigned' in the subtitle when mine_party_appt_type_code is 'PMT' and no permit is found", () => {
    const partyRelationship = {
      ...MOCK.PARTYRELATIONSHIPS[0],
      mine_party_appt_type_code: "PMT",
      related_guid: "some-guid-that-does-not-exist",
    };
    const { getByText } = renderContext({ ...props, partyRelationship });
    expect(getByText("(No permit assigned)")).toBeInTheDocument();
  });

  it("displays the TSF name in the subtitle when mine_party_appt_type_code is 'EOR'", () => {
    const mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
    const tsf = mine.mine_tailings_storage_facilities[0];
    const partyRelationship = {
      ...MOCK.PARTYRELATIONSHIPS[0],
      mine_party_appt_type_code: "EOR",
      related_guid: tsf.mine_tailings_storage_facility_guid,
    };
    const { getByText } = renderContext({ ...props, mine, partyRelationship });
    expect(getByText(`(${tsf.mine_tailings_storage_facility_name})`)).toBeInTheDocument();
  });

  it("displays the union rep company in the title when mine_party_appt_type_code is 'URP'", () => {
    const partyRelationship = {
      ...MOCK.PARTYRELATIONSHIPS[0],
      mine_party_appt_type_code: "URP",
      union_rep_company: "Union Rep Company",
    };
    const { getByText } = renderContext({ ...props, partyRelationship });
    expect(getByText("Union Rep Company")).toBeInTheDocument();
  });

  it("displays the default title and subtitle when mine_party_appt_type_code is not specialized", () => {
    const partyRelationship = {
      ...MOCK.PARTYRELATIONSHIPS[0],
      mine_party_appt_type_code: "MMG",
    };
    const { getByText } = renderContext({
      ...props,
      partyRelationship,
      partyRelationshipTitle: "Custom Title",
      partyRelationshipSubTitle: "Custom Subtitle",
    });
    expect(getByText("Custom Title")).toBeInTheDocument();
    expect(getByText("(Custom Subtitle)")).toBeInTheDocument();
  });
});
