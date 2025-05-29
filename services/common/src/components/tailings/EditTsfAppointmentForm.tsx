import React, { FC } from "react";
import { IMinePartyAppt } from "@mds/common/interfaces";
import FormWrapper from "../forms/FormWrapper";
import { Field, getFormValues } from "../forms/form";
import RenderDate from "../forms/RenderDate";
import { getPartyRelationshipTitle } from "@mds/common/redux/selectors/staticContentSelectors";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { dateNotBeforeOther, required } from "@mds/common/redux/utils/Validate";
import { Col, Row, Typography } from "antd";
import { FORM } from "@mds/common/constants/forms";
import RenderCancelButton from "../forms/RenderCancelButton";
import RenderSubmitButton from "../forms/RenderSubmitButton";
import { fetchPartyRelationships, updatePartyRelationship } from "@mds/common/redux/actionCreators/partiesActionCreator";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import { fetchTailingsStorageFacility } from "@mds/common/redux/slices/tailingsSlice";

export enum AppointmentEditAction {
    END = "Terminate"
};

interface EditTsfProps {
    partyAppointment: IMinePartyAppt;
    tsfGuid: string;
    action: AppointmentEditAction;
    isModal?: boolean;
}

const EditTsfAppointmentForm: FC<EditTsfProps> = ({
    partyAppointment,
    tsfGuid,
    action,
    isModal
}) => {
    const dispatch = useAppDispatch();
    const formName = FORM.EDIT_PARTY_RELATIONSHIP;
    const formValues = useAppSelector(getFormValues(FORM.EDIT_PARTY_RELATIONSHIP)) as IMinePartyAppt;

    const partyTitle = useAppSelector(getPartyRelationshipTitle(partyAppointment.mine_party_appt_type_code))

    const onSubmit = (values) => {
        dispatch(updatePartyRelationship(values)).then((resp) => {
            if (resp?.data) {
                const mineGuid = partyAppointment.mine_guid;
                console.log(resp, values, partyAppointment)
                Promise.all([
                    dispatch(fetchTailingsStorageFacility({ mineGuid, tsfGuid })),
                    dispatch(
                        fetchPartyRelationships({
                            mine_guid: mineGuid,
                            relationships: "party",
                            mine_tailings_storage_facility_guid: tsfGuid,
                        })
                    )
                ]);
                dispatch(closeModal());
            }
        });
    };

    return (
        <FormWrapper
            name={formName}
            initialValues={partyAppointment}
            onSubmit={onSubmit}
            isModal={isModal}
        >
            <Typography.Title level={3}>{action} {partyTitle}</Typography.Title>
            <Typography.Paragraph strong>{partyTitle} Term</Typography.Paragraph>
            <Typography.Paragraph>Enter the end date of the {partyTitle}</Typography.Paragraph>
            <Row gutter={[16, 16]}>
                <Col span={12} className="hide-required-indicator">
                    <Field
                        name="start_date"
                        label="Start Date"
                        component={RenderDate}
                        disabled={action === AppointmentEditAction.END}
                    />
                </Col>
                <Col span={12}>
                    <Field
                        name="end_date"
                        label="End Date"
                        component={RenderDate}
                        placeholder="Select date"
                        required
                        validate={[required, dateNotBeforeOther(formValues?.start_date)]}
                    />
                </Col>
            </Row>
            <Row justify="end">
                <RenderCancelButton />
                <RenderSubmitButton
                    buttonText={`${action} ${partyTitle}`}
                />
            </Row>
        </FormWrapper>
    )
};

export default EditTsfAppointmentForm;