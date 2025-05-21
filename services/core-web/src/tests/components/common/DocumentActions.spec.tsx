import React from "react";
import { render } from "@testing-library/react";
import { DocumentActions } from "@/components/common/DocumentActions";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.openDocument = jest.fn();
};

const setupProps = () => {
  props.document = {
    documentName: "fileName",
    documentMangerGuid: "18145c75-49ad-0101-85f3-a43e45ae989a",
  };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("DocumentActions", () => {
  it("renders properly", () => {
    const { container: component } = render(<DocumentActions {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
