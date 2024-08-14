import React, { FC } from "react";
import { Button, ButtonProps } from "antd";
import { ButtonType } from "antd/lib/button";

// DO NOT put antd button types in here: default, primary, ghost, dashed, link, text
declare const AdditionalTypes: ["tertiary", "filled-tertiary"];
// Additional doesn't exist at compile-time, I have not found a way around this. :(
// for now the two arrays should be duplicated.
const additionalTypes = ["tertiary", "filled-tertiary"];

type CoreCustomType = typeof AdditionalTypes[number];

// this one is the default because it's not used anywhere in the system,
// therefore it can be styled freely
const defaultButtonType = "dashed";

interface CoreButtonProps extends Omit<ButtonProps, "type"> {
  type: ButtonType | CoreCustomType;
}

const CoreButton: FC<CoreButtonProps> = ({ type, className, children, ...props }) => {
  const isAntdType = additionalTypes.includes(type);
  const buttonType = isAntdType ? defaultButtonType : (type as ButtonType);
  const buttonClassName = ["core-btn", `core-btn-${type}`, className].join(" ").trim();

  return (
    <Button {...props} type={buttonType} className={buttonClassName}>
      {children}
    </Button>
  );
};

export default CoreButton;
