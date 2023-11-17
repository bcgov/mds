import React from "react";
import { shallow } from "enzyme";
import * as String from "@mds/common/constants/strings";
import RedirectRoute from "@/routes/routeWrappers/RedirectRoute";
import * as routes from "@/constants/routes";

const props = {};

const setupProps = () => {
  props.path = routes.DASHBOARD.route;
  props.redirectTo = routes.MINE_HOME_PAGE.dynamicRoute({
    page: String.DEFAULT_PAGE,
    per_page: String.DEFAULT_PER_PAGE,
  });
};

beforeEach(() => {
  setupProps();
});

describe("RedirectRoute ", () => {
  it("renders properly", () => {
    const component = shallow(<RedirectRoute {...props} />);
    expect(component).toMatchSnapshot();
  });
});
