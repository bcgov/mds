import React, { FC } from "react";
import { useAppDispatch } from "@mds/common/redux/rootState";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import { IPermitCondition } from "@mds/common/interfaces";
import { Button, Result, Row, Typography } from "antd";


const label = {
    SEC: "section? All associated conditions and list items will be removed.",
    CON: "condition? All associated list items will be removed.",
    LIS: "list item?",
};

interface DeleteConditionModalProps {
    condition: IPermitCondition;
    onSubmit: () => void | Promise<void>;
    onCancel: () => void;
    title: string;
}

export const DeleteConditionModal: FC<DeleteConditionModalProps> = ({ condition, onSubmit, onCancel, title }) => {

    const dispatch = useAppDispatch();
    const handleCancel = () => {
        onCancel();
        dispatch(closeModal());
    }
    const handleSubmit = () => {
        onSubmit();
        dispatch(closeModal());
    }
    return (
        <div>
            <Result
                status="warning"
                title={`Are you sure you want to delete the following ${label[condition.condition_type_code]
                    }`}
            />
            <Typography.Paragraph strong>
                {condition.stepPath}
            </Typography.Paragraph>
            <Typography.Paragraph>
                {condition.condition}
            </Typography.Paragraph>
            <Row justify="end" className="form-button-container-row">
                <Button
                    className="form-btn"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button
                    className="form-btn"
                    type="primary"
                    onClick={handleSubmit}
                >
                    {title}
                </Button>
            </Row>
        </div>
    );
}