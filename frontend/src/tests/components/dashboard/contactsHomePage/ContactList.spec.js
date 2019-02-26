import React from "react";
import { shallow } from "enzyme";
import ContactList from "@/components/dashboard/contactsHomePage/ContactList";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.partyIds = MOCK.PARTY.partyIds;
  props.parties = MOCK.PARTY.parties;
};

beforeEach(() => {
  setupProps();
});

describe("ContactList", () => {
  it("renders properly", () => {
    const component = shallow(<ContactList {...props} />);
    expect(component).toMatchSnapshot();
  });
});
