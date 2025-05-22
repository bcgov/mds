import React from "react";
import { render } from "@testing-library/react";
import { SearchCoordinatesForm } from "@/components/Forms/SearchCoordinatesForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe("SearchCoordinatesForm", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><SearchCoordinatesForm {...dispatchProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
