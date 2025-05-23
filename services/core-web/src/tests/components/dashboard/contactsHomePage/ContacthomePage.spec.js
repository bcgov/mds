import React from "react";
import { shallow } from "enzyme";
import * as String from "@mds/common/constants/strings";
import { ContactHomePage } from "@/components/dashboard/contactsHomePage/ContactHomePage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import * as router from "@/constants/routes";

const dispatchProps = {
  fetchParties: jest.fn(() => Promise.resolve({})),
  fetchProvinceCodes: jest.fn(),
  fetchPartyRelationshipTypes: jest.fn(() => Promise.resolve({})),
  openModal: jest.fn(),
  closeModal: jest.fn(),
};
const reducerProps = {
  location: { search: " " },
  history: {
    replace: jest.fn(),
    location: {},
  },
  parties: MOCK.PARTY.parties,
  provinceOptions: MOCK.DROPDOWN_PROVINCE_OPTIONS,
  pageData: MOCK.PAGE_DATA,
  partyRelationshipTypesList: MOCK.PARTY_RELATIONSHIP_TYPES,
  relationshipTypeHash: MOCK.PARTY_RELATIONSHIP_TYPE_HASH,
};

// TypeError: Cannot read properties of undefined (reading 'length')

//     80 |     phone: party.phone_no && party.phone_no !== "Unknown" ? party.phone_no : Strings.EMPTY_FIELD,
//     81 |     role:
//   > 82 |       party.mine_party_appt.length > 0
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
