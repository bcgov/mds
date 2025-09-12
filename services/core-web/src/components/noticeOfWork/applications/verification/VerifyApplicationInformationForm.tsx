import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Divider, Popconfirm } from "antd";

import {
    formValueSelector,
    reset as reduxFormReset,
    change as reduxFormChange,
} from "@mds/common/components/forms/form";
import * as FORM from "@/constants/forms";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { clearAllSearchResults as clearAllSearchResultsAction } from "@mds/common/redux/actionCreators/searchActionCreator";
import { resetForm } from "@common/utils/helpers";
import EditNOWMineAndLocation from "@/components/Forms/noticeOfWork/EditNOWMineAndLocation";
import VerifyNoWContacts from "@/components/Forms/noticeOfWork/VerifyNoWContacts";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { INoticeOfWork, IParty } from "@mds/common/interfaces";

export interface NoticeOfWorkContact {
    id?: string; // assigned client side
    party_guid?: string | null;
    mine_party_appt_type_code?: string;
    mine_party_appt_type_code_description?: string;
    party?: IParty | null;
    [key: string]: any; // allow passthrough of unknown fields (legacy form data)
}

export interface VerifyApplicationInformationFormProps {
    noticeOfWork: INoticeOfWork;
    originalNoticeOfWork: INoticeOfWork;
    mineGuid: string;
    onSubmit: (values: any) => void | Promise<any>;
    initialValues?: any;
    isImporting: boolean;
    // Optional overrides (mainly for unit tests or external customization)
    longitude?: string;
    latitude?: string;
    mine_guid?: string;
    contactFormValues?: NoticeOfWorkContact[];
    // Optional injected action overrides (tests)
    reset?: (form: string) => void;
    change?: (form: string, field: string, value: any) => void;
    clearAllSearchResults?: () => void;
}

const selector = formValueSelector(FORM.VERIFY_NOW_APPLICATION_FORM);

export const VerifyApplicationInformationForm: React.FC<VerifyApplicationInformationFormProps> = (props) => {
    const dispatch = useDispatch();

    // Always select from redux-form; allow explicit prop overrides if provided.
    const selectedLatitude = useSelector((state: any) => selector(state, "latitude"));
    const selectedLongitude = useSelector((state: any) => selector(state, "longitude"));
    const selectedMineGuid = useSelector((state: any) => selector(state, "mine_guid"));
    const selectedContacts = useSelector((state: any) => selector(state, "contacts")) || [];

    const latitude = props.latitude ?? selectedLatitude;
    const longitude = props.longitude ?? selectedLongitude;
    const mine_guid = props.mine_guid ?? selectedMineGuid;
    const contactFormValues = props.contactFormValues ?? selectedContacts;

    // Provide dispatch-backed implementations if not passed.
    const reset = props.reset ?? ((form: string) => dispatch(reduxFormReset(form)));
    const change = props.change ?? ((form: string, field: string, value: any) => dispatch(reduxFormChange(form, field, value)));
    const clearAllSearchResults = props.clearAllSearchResults ?? (() => dispatch(clearAllSearchResultsAction() as any));

    const [wasFormReset, setWasFormReset] = useState(false);

    const values = useMemo(
        () =>
            props.initialValues ?? {
                mine_guid: props.mineGuid,
                longitude: props.noticeOfWork.longitude,
                latitude: props.noticeOfWork.latitude,
            },
        [props.initialValues, props.mineGuid, props.noticeOfWork?.longitude, props.noticeOfWork?.latitude]
    );

    useEffect(() => {
        setWasFormReset(false);
    }, [contactFormValues]);

    const handleReset = () => {
        setWasFormReset(true);
        reset(FORM.VERIFY_NOW_APPLICATION_FORM);
        change(FORM.VERIFY_NOW_APPLICATION_FORM, "contacts", props.originalNoticeOfWork.contacts);
        clearAllSearchResults();
    };

    const formValuesWithParty = contactFormValues.filter(({ party_guid }) => party_guid).length;
    const confirmed = `${formValuesWithParty}/${contactFormValues.length} contacts confirmed`;
    const disabled = contactFormValues.length > formValuesWithParty || !mine_guid;
    const noMine = mine_guid ? "" : "A mine must be associated to this application";

    return (
        <FormWrapper
            name={FORM.VERIFY_NOW_APPLICATION_FORM}
            reduxFormConfig={{
                enableReinitialize: true,
                onSubmitSuccess: resetForm(FORM.VERIFY_NOW_APPLICATION_FORM),
            }}
            initialValues={values}
            onSubmit={props.onSubmit}
        >
            <h4>Verify Mine</h4>
            <p>
                Review the information below to confirm that this Notice of Work belongs with this mine
                record.
            </p>
            <br />
            <p>
                You can change the mine and/or update the NoW&lsquo;s Longitude and Latitude. All
                information can be updated on the Administrative tab after the initial verification until
                issuance of the permit.
            </p>
            <br />
            <EditNOWMineAndLocation latitude={latitude} longitude={longitude} />
            <br />
            <br />
            <h4>Match the contacts from the Notice of Work application to contacts in Core.</h4>
            <Divider />
            <VerifyNoWContacts
                contactFormValues={contactFormValues}
                wasFormReset={wasFormReset}
                isImporting={props.isImporting}
            />
            <div className="right center-mobile">
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                    <Popconfirm
                        placement="bottomRight"
                        title="Are you sure you want to cancel? The form will be reset to the original state."
                        okText="Yes"
                        cancelText="No"
                        onConfirm={handleReset}
                    >
                        <Button type={"secondary" as any}>Cancel</Button>
                    </Popconfirm>
                    <Button type="primary" htmlType="submit" loading={props.isImporting} disabled={disabled}>
                        Verify Application
                    </Button>
                </AuthorizationWrapper>
                <p className="violet">{confirmed}</p>
                <p className="red">{noMine}</p>
            </div>
        </FormWrapper>
    );
};

export default VerifyApplicationInformationForm;
