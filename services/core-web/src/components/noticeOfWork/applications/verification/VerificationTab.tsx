import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import {
    fetchImportedNoticeOfWorkApplication,
    importNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import VerifyApplicationInformationForm from "@/components/noticeOfWork/applications/verification/VerifyApplicationInformationForm";

export interface VerificationTabProps {
    mineGuid: string;
    originalNoticeOfWork: any;
    noticeOfWork: any;
}

export const VerificationTab: React.FC<VerificationTabProps> = (props) => {
    const [isImporting, setIsImporting] = useState(false);
    const dispatch = useDispatch();

    const handleNOWImport = useCallback(
        (values: any) => {
            setIsImporting(true);

            const contacts = (values.contacts || []).map((contact: any) => ({
                mine_party_appt_type_code: contact.mine_party_appt_type_code,
                party_guid: contact.party_guid,
            }));

            const payload = {
                ...values,
                contacts,
            };

            return Promise.resolve(
                dispatch(importNoticeOfWorkApplication(props.noticeOfWork.now_application_guid, payload) as any)
            )
                .then(() =>
                    Promise.resolve(
                        dispatch(
                            fetchImportedNoticeOfWorkApplication(
                                props.noticeOfWork.now_application_guid
                            ) as any
                        )
                    )
                )
                .finally(() => setIsImporting(false));
        },
        [props.noticeOfWork?.now_application_guid, dispatch]
    );

    return (
        <div className="tab__content">
            <VerifyApplicationInformationForm
                isImporting={isImporting}
                originalNoticeOfWork={props.originalNoticeOfWork}
                noticeOfWork={props.noticeOfWork}
                mineGuid={props.mineGuid}
                onSubmit={handleNOWImport}
                initialValues={props.originalNoticeOfWork}
            />
        </div>
    );
};

export default VerificationTab;
