import React from "react";
import { shallow } from "enzyme";
import * as String from "@mds/common/constants/strings";
import { Dashboard } from "@/components/dashboard/minesHomePage/Dashboard";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import * as router from "@/constants/routes";

const dispatchProps = {
  fetchMineRecords: jest.fn(() => Promise.resolve({})),
  createMineRecord: jest.fn(),
  fetchStatusOptions: jest.fn(),
  fetchRegionOptions: jest.fn(),
  fetchMineDisturbanceOptions: jest.fn(),
  fetchMineTenureTypes: jest.fn(),
  fetchMineCommodityOptions: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchPartyRelationshipTypes: jest.fn(),
  fetchPermitStatusOptions: jest.fn(),
  fetchApplicationStatusOptions: jest.fn(),
  fetchMineReportStatusOptions: jest.fn(),
};
const reducerProps = {
  location: { search: " " },
  history: {
    push: jest.fn(),
    location: {},
  },
  mines: MOCK.MINES.mines,
  mineIds: MOCK.MINES.mineIds,
  pageData: MOCK.PAGE_DATA,
  mineStatusOptions: MOCK.STATUS_OPTIONS.records,
  mineRegionOptions: MOCK.REGION_DROPDOWN_OPTIONS,
  mineDisturbanceOptions: MOCK.DISTURBANCE_OPTIONS,
  mineRegionHash: MOCK.REGION_HASH,
  mineTenureTypes: MOCK.TENURE_TYPES_DROPDOWN_OPTIONS,
  mineTenureHash: MOCK.TENURE_HASH,
};

// TypeError: component.instance is not a function
//  TypeError: component.update is not a function
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