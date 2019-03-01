import React from "react";
import { shallow } from "enzyme";
import { ContactHomePage } from "@/components/dashboard/contactsHomePage/ContactHomePage";
import * as MOCK from "@/tests/mocks/dataMocks";
import * as router from "@/constants/routes";
import * as String from "@/constants/strings";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchParties = jest.fn(() => Promise.resolve({}));
  dispatchProps.fetchPartyRelationshipTypes = jest.fn(() => Promise.resolve({}));
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.location = { search: " " };
  reducerProps.history = {
    push: jest.fn(),
    location: {},
  };
  reducerProps.mines = MOCK.PARTY.parties;
  reducerProps.mineIds = MOCK.PARTY.partyIds;
  reducerProps.pageData = MOCK.PAGE_DATA;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("ContactHomePage", () => {
  it("renders properly", () => {
    const component = shallow(<ContactHomePage {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });

  describe("lifecycle methods", () => {
    it("componentDidMount with `params` from the URL", () => {
      const component = shallow(<ContactHomePage {...dispatchProps} {...reducerProps} />);
      const instance = component.instance();
      const renderDataFromURLSpy = jest.spyOn(instance, "renderDataFromURL");
      reducerProps.location.search = "?page=1&per_page=25";
      const params = reducerProps.location.search;
      instance.renderDataFromURL(params);
      expect(renderDataFromURLSpy).toHaveBeenCalledWith(params);
    });

    it("componentDidMount without `params` from the URL", () => {
      const component = shallow(<ContactHomePage {...dispatchProps} {...reducerProps} />);
      component.update();
      reducerProps.history.push(
        router.CONTACT_HOME_PAGE.dynamicRoute({
          page: String.DEFAULT_PAGE,
          per_page: String.DEFAULT_PER_PAGE,
        })
      );
      expect(reducerProps.history.push).toHaveBeenCalledWith(
        router.CONTACT_HOME_PAGE.dynamicRoute({
          page: String.DEFAULT_PAGE,
          per_page: String.DEFAULT_PER_PAGE,
        })
      );
    });
  });
});
