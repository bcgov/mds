import React, { FC } from "react";
import { render } from "@testing-library/react";
import AddPartyComponentWrapper from "@/components/common/wrappers/AddPartyComponentWrapper";
import { MODAL } from "@mds/common/constants/reducerTypes";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const TestComponent: FC<{ prop1: string }> = ({ prop1 }) => <div>{prop1}</div>;
const childProps = {
  title: "title",
  prop1: "modal content",
};

const initialState = {
  [MODAL]: {
    isModalOpen: true,
    width: 150,
    isViewOnly: false,
    content: TestComponent,
    props: childProps,
  },
};
describe("AddPartyComponentWrapper", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <AddPartyComponentWrapper content={TestComponent} childProps={childProps} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
