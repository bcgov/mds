import React from "react";
import { shallow } from "enzyme";
import { MinespaceUserList } from "@/components/admin/MinespaceUserList";

describe("MinespaceUserList", () => {
  it("renders properly", () => {
    const component = shallow(<MinespaceUserList />);
    expect(component).toMatchSnapshot();
  });
});
