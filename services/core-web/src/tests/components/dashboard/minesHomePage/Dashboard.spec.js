import React from "react";
import { shallow } from "enzyme";
import * as String from "@mds/common/constants/strings";
import { Dashboard } from "@/components/dashboard/minesHomePage/Dashboard";
import * as MOCK from "@/tests/mocks/dataMocks";
import * as router from "@/constants/routes";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecords = jest.fn(() => Promise.resolve({}));
  dispatchProps.createMineRecord = jest.fn();
  dispatchProps.fetchStatusOptions = jest.fn();
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.fetchMineDisturbanceOptions = jest.fn();
  dispatchProps.fetchMineTenureTypes = jest.fn();
  dispatchProps.fetchMineCommodityOptions = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchPartyRelationshipTypes = jest.fn();
  dispatchProps.fetchPermitStatusOptions = jest.fn();
  dispatchProps.fetchApplicationStatusOptions = jest.fn();
  dispatchProps.fetchMineReportStatusOptions = jest.fn();
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
  reducerProps.mineStatusOptions = MOCK.STATUS_OPTIONS.records;
  reducerProps.mineRegionOptions = MOCK.REGION_DROPDOWN_OPTIONS;
  reducerProps.mineDisturbanceOptions = MOCK.DISTURBANCE_OPTIONS;
  reducerProps.mineRegionHash = MOCK.REGION_HASH;
  reducerProps.mineTenureTypes = MOCK.TENURE_TYPES_DROPDOWN_OPTIONS;
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
    });

    it("componentDidMount without `params` from the URL", () => {
      const component = shallow(<Dashboard {...dispatchProps} {...reducerProps} />);
      component.update();
      reducerProps.history.push(
        router.MINE_HOME_PAGE.dynamicRoute({
          page: String.DEFAULT_PAGE,
          per_page: String.DEFAULT_PER_PAGE,
        })
      );
      expect(reducerProps.history.push).toHaveBeenCalledWith(
        router.MINE_HOME_PAGE.dynamicRoute({
          page: String.DEFAULT_PAGE,
          per_page: String.DEFAULT_PER_PAGE,
        })
      );
    });
  });
});
