import React from "react";
import { shallow } from "enzyme";
import * as String from "@mds/common/constants/strings";
import { ContactHomePage } from "@/components/dashboard/contactsHomePage/ContactHomePage";
import * as MOCK from "@/tests/mocks/dataMocks";
import * as router from "@/constants/routes";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchParties = jest.fn(() => Promise.resolve({}));
  dispatchProps.fetchProvinceCodes = jest.fn();
  dispatchProps.fetchPartyRelationshipTypes = jest.fn(() => Promise.resolve({}));
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.location = { search: " " };
  reducerProps.history = {
    replace: jest.fn(),
    location: {},
  };
  reducerProps.parties = MOCK.PARTY.parties;
  reducerProps.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
  reducerProps.pageData = MOCK.PAGE_DATA;
  reducerProps.partyRelationshipTypesList = MOCK.PARTY_RELATIONSHIP_TYPES;
  reducerProps.relationshipTypeHash = MOCK.PARTY_RELATIONSHIP_TYPE_HASH;
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
      instance.renderDataFromURL();
      expect(renderDataFromURLSpy).toHaveBeenCalledWith();
    });

    it("componentDidMount without `params` from the URL", () => {
      const component = shallow(<ContactHomePage {...dispatchProps} {...reducerProps} />);
      component.update();
      reducerProps.history.replace(
        router.CONTACT_HOME_PAGE.dynamicRoute({
          page: String.DEFAULT_PAGE,
          per_page: String.DEFAULT_PER_PAGE,
        })
      );
      expect(reducerProps.history.replace).toHaveBeenCalledWith(
        router.CONTACT_HOME_PAGE.dynamicRoute({
          page: String.DEFAULT_PAGE,
          per_page: String.DEFAULT_PER_PAGE,
        })
      );
    });
  });
});
