import React from "react";
import { shallow } from "enzyme";
import NotificationDrawer from "@/components/navigation/NotificationDrawer";
import { Provider } from "react-redux";
import { store } from "@/App";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchActivities = jest.fn();
};

const setupProps = () => {
  props.userInfo = {};
  props.activities = [];
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("Notification Drawer", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <NotificationDrawer {...props} {...dispatchProps} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
