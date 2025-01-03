import React from "react";
import { render } from "@testing-library/react";
import AddIncidentDetailForm from "@/components/Forms/incidents/AddIncidentDetailForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { ACTIVITIES } from "@mds/common/constants/reducerTypes";

const initialState = {
  [ACTIVITIES]: {
    activities: MOCK.ACTIVITIES.data.records,
    totalActivities: MOCK.ACTIVITIES.data.records.length,
  },
};

describe("AddIncidentDetailForm", () => {
  it("renders properly", () => {
    const { container } = render(<ReduxWrapper initialState={initialState}><AddIncidentDetailForm
      initialValues={{}}
      incidentDeterminationOptions={MOCK.BULK_STATIC_CONTENT_RESPONSE.incidentDeterminationOptions}
      uploadedFiles={[]}
    /></ReduxWrapper>);
    expect(container).toMatchSnapshot();
  });
});
