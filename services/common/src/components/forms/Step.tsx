import React, { FC } from "react";

export interface StepProps {
  disabled?: boolean;
  key: string;
}

const Step: FC<StepProps> = (props) => {
  return <>{props.children}</>;
};

export default Step;
