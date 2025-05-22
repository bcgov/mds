import React from "react";
import { render } from "@testing-library/react";
import { RenderMineSelect } from "@/components/common/RenderMineSelect";
import { PARTY } from "@mds/common/tests/mocks/dataMocks";

let props = {};

const setupProps = () => {
  props = {
    id: "1",
    input: "",
    label: "",
    type: "",
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
    data: [],
    option: {},
    name: "field",
    fetchMineNameList: jest.fn(),
    mineNameList: [],
    placeholder: "Select",
    disabled: false,
    majorMineOnly: false,
    onMineSelect: jest.fn(),
    fullWidth: true,
    additionalPin: [],
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderMineSelect", () => {
  it("renders properly", () => {
    const { container: component } = render(<RenderMineSelect {...props} />);
    expect(component).toMatchSnapshot();
  });
});
