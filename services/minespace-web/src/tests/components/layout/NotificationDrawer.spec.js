import React from "react";
import NotificationDrawer from "@/components/layout/NotificationDrawer";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { AUTHENTICATION, ACTIVITIES } from "@mds/common/constants/reducerTypes";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/App";

const initialState = {
  [AUTHENTICATION]: {
    userInfo: { preferred_username: "USERNAME" },
  },
  [ACTIVITIES]: {
    activities: MOCK.ACTIVITIES.data.records,
  },
};

describe("Notification Drawer", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <Provider store={store}>
          <NotificationDrawer />
        </Provider>
      </ReduxWrapper>
    );

    expect(container).toMatchSnapshot();
  });
});
