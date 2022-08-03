import React from "react";
import { shallow } from "enzyme";
import { MajorMineApplicationPage } from "@/components/pages/Project/MajorMineApplicationPage";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  props.majorMinesApplicationDocumentTypesHash = MOCK.MAJOR_MINES_APPLICATION_DOCUMENT_TYPES_HASH;
  props.project = {};
  props.mines = {};
  props.fieldsTouched = {};
};

const setupDispatchProps = () => {
  dispatchProps.fetchProjectById = jest.fn(() => Promise.resolve());
  dispatchProps.createMajorMineApplication = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MajorMinesApplicationPage", () => {
  it("renders properly", () => {
    const component = shallow(<MajorMineApplicationPage {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
