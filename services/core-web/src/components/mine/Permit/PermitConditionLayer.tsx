import React, { FC } from "react";
import { IPermitCondition } from "@mds/common";

interface PermitConditionLayerProps {
  condition: IPermitCondition;
}

const PermitConditionLayer: FC<PermitConditionLayerProps> = ({ condition }) => {
  return (
    <>
      <p>{condition.condition}</p>
      {condition?.sub_conditions?.map((condition) => {
        return <PermitConditionLayer condition={condition} key={condition.permit_condition_id} />;
      })}
    </>
  );
};

export default PermitConditionLayer;
