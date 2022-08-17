import React from "react";
import { shallow } from "enzyme";
import { DocumentsPage } from "@/components/pages/Project/DocumentsPage";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.title = "mockTitle";
  props.documents = [
    ...MOCK.PROJECT_SUMMARY.documents,
    ...MOCK.INFORMATION_REQUIREMENTS_TABLE.documents,
    ...MOCK.MAJOR_MINES_APPLICATION.documents,
  ];
};

beforeEach(() => {
  setupProps();
});

describe("DocumentsPage", () => {
  it("renders properly", () => {
    const component = shallow(<DocumentsPage {...props} />);
    expect(component).toMatchSnapshot();
  });
});
