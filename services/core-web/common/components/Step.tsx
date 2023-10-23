import React, { FC } from "react";

interface StepProps {
  disabled?: boolean;
  key: string;
}

const Step: FC<StepProps> = (props) => {
  return <>{props.children}</>;
};

export default Step;
