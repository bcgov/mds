import React, { FC } from "react";
import { Col, Row } from "antd";
import { IOption } from "@mds/common/interfaces";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import {
    Field,
} from "@mds/common/components/forms/form";
import {
    required,
    requiredRadioButton,
} from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

interface AddNOWApplicationNationModalProps {
    pipConsultationAreaOptions: IOption[];
    onSubmit: (values) => void | Promise<void>;
}

export const AddNOWApplicationNationModal: FC<AddNOWApplicationNationModalProps> = ({
    pipConsultationAreaOptions,
    onSubmit,
}) => {
    return (
        <div>
            <FormWrapper onSubmit={onSubmit} name={FORM.ADD_NOTICE_OF_WORK_NATION_FORM}
                isModal
                reduxFormConfig={{
                    touchOnBlur: false,
                }}>
                <Row gutter={48}>
                    <Col md={24} sm={24}>
                        <Field
                            id="pip_consultation_area"
                            name="pip_consultation_area"
                            label="Nations"
                            placeholder="Select a nation"
                            component={renderConfig.SELECT}
                            required
                            validate={[required]}
                            data={pipConsultationAreaOptions}
                            enableGetPopupContainer={false}
                        />
                        <Field
                            id="due_date"
                            name="due_date"
                            label="Due Date"
                            component={renderConfig.DATE}
                            required
                            validate={[required]}
                        />
                        <Field
                            id="consultation_started_by_client"
                            name="consultation_started_by_client"
                            label="Consultation started by client?"
                            component={RenderRadioButtons}
                            required
                            validate={[requiredRadioButton]}
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

export default AddNOWApplicationNationModal;
