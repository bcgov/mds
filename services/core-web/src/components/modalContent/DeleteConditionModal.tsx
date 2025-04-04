import React, { FC } from "react";
import { Result, Button } from "antd";
import ConditionLayerOne from "@/components/Forms/permits/conditions/ConditionLayerOne";
import { useAppDispatch } from "@mds/common/redux/rootState";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import { IPermitCondition } from "@mds/common/interfaces";

interface DeleteConditionModalProps {
  handleDelete: (condition: IPermitCondition) => void | Promise<void>;
  title: string;
  submitting: boolean;
  condition: IPermitCondition;
}

const label = {
  SEC: "section? All associated conditions and list items will be removed.",
  CON: "condition? All associated list items will be removed.",
  LIS: "list item?",
};

export const DeleteConditionModal: FC<DeleteConditionModalProps> = (props) => {
  const dispatch = useAppDispatch();
  return (
    <div>
      <Result
        status="warning"
        style={{ padding: "0px" }}
        title={`Are you sure you want to delete the following ${label[props.condition.condition_type_code]
          }`}
      />
      <br />
      <ConditionLayerOne condition={props.condition} isViewOnly />
      <div className="right center-mobile">
        <Button className="full-mobile" type="default" onClick={() => dispatch(closeModal())}>
          Cancel
        </Button>
        <Button
          className="full-mobile"
          type="primary"
          htmlType="submit"
          onClick={() => props.handleDelete(props.condition)}
          loading={props.submitting}
        >
          {props.title}
        </Button>
      </div>
    </div>
  );
};

export default DeleteConditionModal;
