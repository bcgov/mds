import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import * as MOCK from "@/tests/mocks/dataMocks";
import AddNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/AddNoticeOfDepartureForm";
import { store } from "@/App";

const dispatchProps: any = {};
const props: any = {};

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
    const component = shallow(
      <Provider store={store}>
        <AddNoticeOfDepartureForm {...dispatchProps} {...props} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
