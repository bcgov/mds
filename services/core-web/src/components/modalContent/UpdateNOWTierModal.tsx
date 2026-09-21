import React, { FC } from "react";
import UpdateNOWTierForm from "@/components/Forms/noticeOfWork/UpdateNOWTierForm";
import { INoticeOfWork } from "@mds/common/interfaces";
import * as FORM from "@/constants/forms";

interface UpdateNOWTierModalProps {
    onSubmit: (values: any) => void | Promise<any>;
    closeModal: () => void;
    title: string;
    noticeOfWork: INoticeOfWork;
    initialValues?: {
        now_application_tier_code: string;
        now_application_tier_description: string;
    };
}

export const UpdateNOWTierModal: FC<UpdateNOWTierModalProps> = (props) => (
    <div>
        <UpdateNOWTierForm
            formName={FORM.UPDATE_NOW_TIER_MODAL}
            onSubmit={props.onSubmit}
            onCancel={props.closeModal}
            title={props.title}
            noticeOfWork={props.noticeOfWork}
            initialValues={props.initialValues ?? {
                now_application_tier_code: props.noticeOfWork.now_application_tier_code,
                now_application_tier_description: props.noticeOfWork.now_application_tier_description,
            }}
        />
    </div>
);

export default UpdateNOWTierModal;
