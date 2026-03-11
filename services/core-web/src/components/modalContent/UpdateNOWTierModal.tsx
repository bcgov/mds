import React, { FC } from "react";
import UpdateNOWTierForm from "@/components/Forms/noticeOfWork/UpdateNOWTierForm";
import { INoticeOfWork } from "@mds/common/interfaces";

interface UpdateNOWTierModalProps {
    onSubmit: (values: any) => void | Promise<any>;
    closeModal: () => void;
    title: string;
    noticeOfWork: INoticeOfWork;
    initialValues: {
        now_application_tier_code: string;
        now_application_tier_description: string;
    };
}

export const UpdateNOWTierModal: FC<UpdateNOWTierModalProps> = (props) => (
    <div>
        <UpdateNOWTierForm
            onSubmit={props.onSubmit}
            onCancel={props.closeModal}
            title={props.title}
            initialValues={props.initialValues}
        />
    </div>
);

export default UpdateNOWTierModal;
