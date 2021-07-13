import React from "react";
import { shallow } from "enzyme";
import { ViewMagazineModal } from "@/components/modalContent/ViewMagazineModal";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.onSubmit = jest.fn();
  props.type = "EXP";
  props.mine = {};
  [props.explosivesPermit] = MOCK.EXPLOSIVES_PERMITS.data.records;
};

beforeEach(() => {
  setupProps();
});

describe("ViewMagazineModal", () => {
  it("renders properly", () => {
    const component = shallow(<ViewMagazineModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
