import React from "react";
import { shallow } from "enzyme";
import MineIncidentTable from "@/components/mine/Incidents/MineIncidentTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleEditMineIncident = jest.fn();
  dispatchProps.handleDeleteMineIncident = jest.fn();
};

const setupProps = () => {
  props.followupActions = MOCK.FOLLOWUP_ACTIONS;
  props.incidents = MOCK.INCIDENTS.records;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

// TypeError: text.map is not a function

//       245 |           ) : (
//       246 |             <span>
//     > 247 |               {text.map((code) => (
//           |                     ^
//       248 |                 <div key={code}>{complianceCodesHash[code]}</div>
//       249 |               ))}
//       250 |             </span>
describe("MineIncidentTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineIncidentTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
