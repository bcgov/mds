import React from "react";
import { render } from "@testing-library/react";
import FileOutlined from "@ant-design/icons/FileOutlined";
import CoreButton, { CoreButtonProps } from "./CoreButton";

const propsArray: CoreButtonProps[] = [
  {
    type: "default",
    ghost: true,
    className: "test-class ",
    icon: <FileOutlined />,
    htmlType: "reset",
  },
  {
    type: "primary",
    children: (
      <>
        <span>Text with icon</span>
        <FileOutlined />
      </>
    ),
  },
  { type: "ghost", htmlType: "submit", size: "large", loading: { delay: 10 } },
  { type: "dashed", size: "small", children: <FileOutlined /> },
  { type: "link", style: { color: "green" }, href: "https://www.example.com", target: "blank" },
  { type: "text", disabled: true, shape: "round", prefixCls: "test-prefix" },
  { type: "tertiary", ghost: true, children: <div>button label</div> },
  { type: "filled-tertiary", loading: true, block: true, danger: true },
];

describe("Buttons", () => {
  it("renders all buttons properly", () => {
    const { container } = render(
      <>
        {propsArray.map(({ children, ...props }) => {
          return children ? (
            <CoreButton {...props} key={props.type} id={props.type}>
              {children}
            </CoreButton>
          ) : (
            <CoreButton {...props} key={props.type} id={props.type} />
          );
        })}
      </>
    );
    expect(container).toMatchSnapshot();
  });
});
