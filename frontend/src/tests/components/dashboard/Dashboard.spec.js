import React from "react";
import { shallow } from "enzyme";
import { Dashboard } from "@/components/dashboard/Dashboard";
import * as MOCK from "@/tests/mocks/dataMocks";
import * as router from "@/constants/routes";
import * as String from "@/constants/strings";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecords = jest.fn(() => Promise.resolve({}));
  dispatchProps.createMineRecord = jest.fn();
  dispatchProps.fetchStatusOptions = jest.fn();
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.fetchMineTenureTypes = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.location = { search: " " };
  reducerProps.history = {
    push: jest.fn(),
    location: {},
  };
  reducerProps.mines = MOCK.MINES.mines;
  reducerProps.mineIds = MOCK.MINES.mineIds;
  reducerProps.pageData = MOCK.PAGE_DATA;
  reducerProps.mineStatusOptions = MOCK.STATUS_OPTIONS.options;
  reducerProps.mineRegionOptions = MOCK.REGION_OPTIONS.options;
  reducerProps.mineRegionHash = MOCK.REGION_HASH;
  reducerProps.mineTenureTypes = MOCK.TENURE_TYPES.options;
  reducerProps.mineTenureHash = MOCK.TENURE_HASH;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("Dashboard", () => {
  it("renders properly", () => {
    const component = shallow(<Dashboard {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });

  describe("lifecycle methods", () => {
    it("componentDidMount with `params` from the URL", () => {
      const component = shallow(<Dashboard {...dispatchProps} {...reducerProps} />);
      const instance = component.instance();
      const renderDataFromURLSpy = jest.spyOn(instance, "renderDataFromURL");
      reducerProps.location.search = "?page=1&per_page=25";
      const params = reducerProps.location.search;
      instance.renderDataFromURL(params);
      expect(renderDataFromURLSpy).toHaveBeenCalledWith(params);
      expect(dispatchProps.fetchStatusOptions).toHaveBeenCalled();
      expect(dispatchProps.fetchRegionOptions).toHaveBeenCalled();
    });

    it("componentDidMount without `params` from the URL", () => {
      const component = shallow(<Dashboard {...dispatchProps} {...reducerProps} />);
      component.update();
      reducerProps.history.push(
        router.MINE_DASHBOARD.dynamicRoute(String.DEFAULT_PAGE, String.DEFAULT_PER_PAGE)
      );
      expect(reducerProps.history.push).toHaveBeenCalledWith(
        router.MINE_DASHBOARD.dynamicRoute(String.DEFAULT_PAGE, String.DEFAULT_PER_PAGE)
      );
      expect(dispatchProps.fetchStatusOptions).toHaveBeenCalled();
      expect(dispatchProps.fetchRegionOptions).toHaveBeenCalled();
    });
  });
});
