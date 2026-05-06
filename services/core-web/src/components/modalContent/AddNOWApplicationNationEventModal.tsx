import React, { FC } from "react";
import { Col, Row } from "antd";
import { IOption } from "@mds/common/interfaces";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import {
    Field,
} from "@mds/common/components/forms/form";
import {
    required,
    dateNotBeforeOther,
} from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { NOW_APPLICATION_NATION_EVENT_PARTY_OPTIONS } from "@mds/common/constants/enums";

interface AddNOWApplicationNationEventModalProps {
    initialValues?: any;
    eventOptions: IOption[];
    onSubmit: (values) => void | Promise<void>;
    startDateDisabled?: boolean;
}

export const AddNOWApplicationNationEventModal: FC<AddNOWApplicationNationEventModalProps> = ({
    initialValues,
    eventOptions,
    onSubmit,
    startDateDisabled = false,
}) => {
    const nationEventPartyOptions = Object.values(
        NOW_APPLICATION_NATION_EVENT_PARTY_OPTIONS
    ).map((value) => ({
        label: value,
        value,
    }));

    const validateEndDateNotBeforeStartDate = (values) => {
        const errors: any = {};

        if (values?.start_date && values?.end_date) {
            const error = dateNotBeforeOther(values.start_date, "Start Date")(values.end_date);
            if (error) {
                errors.end_date = error;
            }
        }

        return errors;
    };

    return (
        <div>
            <FormWrapper onSubmit={onSubmit} name={FORM.ADD_NOTICE_OF_WORK_NATION_EVENT_FORM}
                isModal
                initialValues={initialValues}
                reduxFormConfig={{
                    touchOnBlur: false,
                    validate: validateEndDateNotBeforeStartDate,
                }}>
                <Row gutter={48}>
                    <Col md={24} sm={24}>
                        <Field
                            id="now_application_nation_event_code"
                            name="now_application_nation_event_code"
                            label="Event/Action"
                            placeholder="Select an event/action"
                            component={renderConfig.SELECT}
                            required
                            validate={[required]}
                            data={eventOptions}
                            enableGetPopupContainer={false}
                        />
                        <Field
                            id="event_from"
                            name="event_from"
                            label="From"
                            placeholder="Select party who initiated the event"
                            component={renderConfig.SELECT}
                            required
                            validate={[required]}
                            data={nationEventPartyOptions}
                        />
                        <Field
                            id="event_to"
                            name="event_to"
                            label="To"
                            placeholder="Select party who is the recipient of the event"
                            component={renderConfig.SELECT}
                            required
                            validate={[required]}
                            data={nationEventPartyOptions}
                        />
                        <Field
                            id="start_date"
                            name="start_date"
                            label="Start Date"
                            component={renderConfig.DATE}
                            required
                            validate={[required]}
                            disabled={startDateDisabled}
                        />

                        <Field
                            id="end_date"
                            name="end_date"
                            label="End Date"
                            component={renderConfig.DATE}
                        />
                    </Col>
                </Row>
                <div className="right center-mobile">
                    <RenderCancelButton />
                    <RenderSubmitButton />
                </div>
            </FormWrapper>
        </div>
    )

};

export default AddNOWApplicationNationEventModal;
