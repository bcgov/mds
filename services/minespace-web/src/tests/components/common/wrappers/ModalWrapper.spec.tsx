import React, { FC } from "react";
import { render } from "@testing-library/react";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import { ReduxWrapper as CommonReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { MODAL } from "@mds/common/constants/reducerTypes";

const TestComponent: FC<{ prop1: string }> = ({ prop1 }) => <div>{prop1}</div>;

const initialState = {
  [MODAL]: {
    isModalOpen: true,
    width: 150,
    isViewOnly: false,
    content: TestComponent,
    props: {
      title: "title",
      prop1: "modal content",
    },
  },
};

describe("ModalWrapper", () => {
  it("renders properly", () => {
    const { container } = render(
      <CommonReduxWrapper initialState={initialState}>
        <ReduxWrapper initialState={initialState}>
          <ModalWrapper />
        </ReduxWrapper>
      </CommonReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
