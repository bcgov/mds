import React, { FC } from "react";
import { connect } from "react-redux";
import { Field } from "@mds/common/components/forms/form";
import { Button, Popconfirm } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { getDropdownNoticeOfWorkTierOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { INoticeOfWork, IOption } from "@mds/common/interfaces";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

interface UpdateNOWTierFormProps {
    onSubmit: (values: any) => void | Promise<any>;
    onCancel?: () => void;
    closeModal?: () => void;
    title: string;
    noticeOfWorkTierOptions: IOption[];
    initialValues?: any;
    isAdminView?: boolean;
    isEditMode?: boolean;
    noticeOfWork?: INoticeOfWork;
}

export const UpdateNOWTierForm: FC<UpdateNOWTierFormProps> = (props) => {
    const isExploration = props.noticeOfWork?.notice_of_work_type_code === "MIN" || props.noticeOfWork?.notice_of_work_type_code === "COL";

    const handleCancel = () => {
        if (props.onCancel) {
            props.onCancel();
        } else if (props.closeModal) {
            props.closeModal();
        }
    }

    return (
        <FormWrapper
            name={FORM.UPDATE_NOW_TIER}
            reduxFormConfig={{
                touchOnBlur: false,
            }}
            onSubmit={props.onSubmit}
            initialValues={props.initialValues}
        >
            <div className="field-title">Tier Category {props.isAdminView && "(initial intake)"}</div>
            <Field
                id="now_application_tier_code"
                name="now_application_tier_code"
                component={renderConfig.SELECT}
                data={props.noticeOfWorkTierOptions}
                required={isExploration}
                validate={isExploration ? [required] : []}
                disabled={props.isAdminView && !props.isEditMode}
            />
            <div className="field-title">Tier Rationale</div>
            <Field
                id="now_application_tier_description"
                name="now_application_tier_description"
                component={renderConfig.AUTO_SIZE_FIELD}
                placeholder="Optionally provide the rationale behind the selected Tier Category"
                disabled={props.isAdminView && !props.isEditMode}
            />
            {(props.isEditMode || !props.isAdminView) && (
                <div className="right center-mobile">
                    <Popconfirm
                        placement="topRight"
                        title="Are you sure you want to cancel?"
                        onConfirm={handleCancel}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button className="full-mobile" type="default">
                            Cancel
                        </Button>
                    </Popconfirm>
                    <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                        <Button className="full-mobile" type="primary" htmlType="submit">
                            {props.title}
                        </Button>
                    </AuthorizationWrapper>
                </div>
            )}
        </FormWrapper>
    );
};

const mapStateToProps = (state) => ({
    noticeOfWorkTierOptions: getDropdownNoticeOfWorkTierOptions(state),
});

export default connect(mapStateToProps)(UpdateNOWTierForm);

