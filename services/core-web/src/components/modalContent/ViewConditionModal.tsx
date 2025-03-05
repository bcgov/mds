import React, { FC } from "react";
import { Button } from "antd";
import ConditionLayerOne from "@/components/Forms/permits/conditions/ConditionLayerOne";
import NullScreen from "@/components/common/NullScreen";
import { useAppDispatch } from "@mds/common/redux/rootState";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import { IPermitCondition } from "@mds/common/interfaces";


interface ViewConditionModalProps {
  conditions: IPermitCondition[];
};

export const ViewConditionModal: FC<ViewConditionModalProps> = (props) => {
  const dispatch = useAppDispatch();
  return (
    <div>
      {props.conditions?.length > 0 ? (
        props.conditions.map((condition) => <ConditionLayerOne key={condition.permit_condition_guid} condition={condition} isViewOnly />)
      ) : (
        <p>
          <NullScreen />
        </p>
      )}
      <div className="right center-mobile">
        <Button className="full-mobile" type="default" onClick={() => dispatch(closeModal())}>
          Close
        </Button>
      </div>
    </div>
  );
};


export default ViewConditionModal;
