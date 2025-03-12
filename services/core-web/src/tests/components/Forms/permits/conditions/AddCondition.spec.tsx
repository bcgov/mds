import React from "react";
import { AddCondition } from "@/components/Forms/permits/conditions/AddCondition";
import { shallow } from "enzyme";
import { PERMITS } from "@mds/common/tests/mocks/dataMocks";


function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mine_guid: "8e9ca839-a28e-427e-997e-9ef23d9d97cd",
      permit_guid: "1628847c-060b-45f2-990f-815877174801",
      id: "8729830e-5e9a-4be8-9eef-dac4af775f1d"
    }),
    useLocation: jest.fn().mockReturnValue({
      location: "",
    })
  };
}


jest.mock("react-router-dom", () => mockFunction());
const condition = PERMITS[0].permit_amendments[0].conditions[0];

describe("AddCondition", () => {
  it("renders properly", async () => {
    const component = shallow(
      <AddCondition
        initialValues={condition}
        layer={0}
        editingConditionFlag={false}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
