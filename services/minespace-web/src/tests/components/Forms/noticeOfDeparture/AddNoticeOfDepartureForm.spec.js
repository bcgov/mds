import React from "react";
import { shallow } from "enzyme";
import * as MOCK from "@/tests/mocks/dataMocks";
import AddNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/AddNoticeOfDepartureForm";

const dispatchProps = {};
const props = {};

const setupProps = () => {
  props.incidentDeterminationOptions = {};
  // eslint-disable-next-line prefer-destructuring
  props.mineGuid = MOCK.MINES.mineIds[0];
  props.permits = MOCK.PERMITS.permits;
  props.initialValues = {};
};

beforeEach(() => {
  setupProps();
});

describe("AddNoticeOfDepartureForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddNoticeOfDepartureForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
