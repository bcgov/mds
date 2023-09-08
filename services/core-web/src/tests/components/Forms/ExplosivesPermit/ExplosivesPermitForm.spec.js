import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitForm } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitForm";

const props = {};

const setupProps = () => {
  props.submitting = false;
  props.isProcessed = false;
  props.isPermitTab = false;
  props.title = "Close Permit";
  props.mineGuid = "523642546";
  props.handleSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.previewDocument = jest.fn();
  props.inspectors = [];
  props.initialValues = {};
  props.formValues = {};
  props.documentTypeDropdownOptions = [];
  props.noticeOfWorkApplications = [];
  props.permits = [];
  props.partyRelationships = [];
  props.allPartyRelationships = [];
  props.mines_permit_guid = "13461346";
  props.userRoles = [];
  props.infoText = "some info";
};

beforeEach(() => {
  setupProps();
});

describe("ExplosivesPermitForm", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
