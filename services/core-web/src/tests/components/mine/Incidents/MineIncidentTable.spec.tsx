import React from "react";
import { shallow } from "enzyme";
import MineIncidentTable from "@/components/mine/Incidents/MineIncidentTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  handleEditMineIncident: jest.fn(),
  handleDeleteMineIncident: jest.fn(),
};
const props = {
  followupActions: MOCK.FOLLOWUP_ACTIONS,
  incidents: MOCK.INCIDENTS.records,
};

describe("MineIncidentTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineIncidentTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
