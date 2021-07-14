import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitFileUpload } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitFileUpload";

const props = {};

const setupProps = () => {
  props.mineGuid = "6234612345";
  props.onFileLoad = jest.fn();
  props.onRemoveFile = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("ExplosivesPermitFileUpload", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitFileUpload {...props} />);
    expect(component).toMatchSnapshot();
  });
});
