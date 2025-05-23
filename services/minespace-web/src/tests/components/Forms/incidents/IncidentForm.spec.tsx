import React from "react";
import { shallow } from "enzyme";
import { IncidentForm } from "@/components/Forms/incidents/IncidentForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  change: jest.fn(),
};
const props = {
  incident: MOCK.INCIDENT,
  isFinalReviewStage: true,
  incidentCategoryCodeOptions: MOCK.INCIDENT_CATEGORY_OPTIONS_HASH,
  formValues: { ...MOCK.INCIDENT },
  handlers: { deleteDocument: jest.fn(() => Promise.resolve()) },
  match: { params: { mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a" } },
  inspectorOptions: [],
};

// TypeError: Cannot read properties of undefined (reading 'incident_timezone')

//       59 |   if (timezoneFieldProps) {
//       60 |     const formValues = useSelector((state) => getFormValues(meta.form)(state));
//     > 61 |     formTimezone = formValues[timezoneFieldProps.name];
//          |                              ^
//       62 |   }
//       63 |
//       64 |   const defaultTimezone = formTimezone ?? timezone ?? userTz;
describe("IncidentForm", () => {
  it("renders properly", () => {
    const component = shallow(<IncidentForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
