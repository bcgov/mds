import React, { FC } from "react";
import { Field } from "@mds/common/components/forms/form";
import { Button, Popconfirm } from "antd";
import { maxLength, required } from "@mds/common/redux/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { getDropdownNoticeOfWorkTierOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { INoticeOfWork } from "@mds/common/interfaces";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { useAppSelector } from "@mds/common/redux/rootState";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";

interface UpdateNOWTierFormProps {
  onSubmit: (values: any) => void | Promise<any>;
  onCancel?: () => void;
  closeModal?: () => void;
  title: string;
  initialValues?: any;
  isAdminView?: boolean;
  isEditMode?: boolean;
  noticeOfWork?: INoticeOfWork;
  formName?: string;
}

export const UpdateNOWTierForm: FC<UpdateNOWTierFormProps> = (props) => {
  const userCanEdit = useAppSelector(userHasRole(USER_ROLES.role_edit_permits));
  const noticeOfWorkTierOptions = useAppSelector(getDropdownNoticeOfWorkTierOptions);
  const isExploration =
    props.noticeOfWork?.notice_of_work_type_code === "MIN" ||
    props.noticeOfWork?.notice_of_work_type_code === "COL";

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    } else if (props.closeModal) {
      props.closeModal();
    }
  };

  return (
    <FormWrapper
      name={props.formName ?? FORM.UPDATE_NOW_TIER}
      reduxFormConfig={{
        touchOnBlur: false,
      }}
      onSubmit={props.onSubmit}
      initialValues={props.initialValues}
    >
      <div className="field-title">
        Tier Category
        {props.noticeOfWork?.now_application_tier_created_date &&
          props.noticeOfWork?.now_application_tier_created_date ===
            props.noticeOfWork?.now_application_tier_updated_date &&
          " (initial intake)"}
      </div>
      {isExploration && (
        <p className="field-title--description">
          Tier selection is required for Mineral or Coal exploration applications.
        </p>
      )}
      <Field
        id="now_application_tier_code"
        name="now_application_tier_code"
        component={renderConfig.SELECT}
        data={noticeOfWorkTierOptions}
        required={isExploration}
        validate={isExploration ? [required] : []}
        disabled={props.isAdminView && !props.isEditMode}
      />
      <div className="field-title">Tier Rationale</div>
      <p className="field-title--description">
        Provide 1-2 paragraph high-level description of reason for tier category rationale.
      </p>
      <Field
        id="now_application_tier_description"
        name="now_application_tier_description"
        maximumCharacters={1500}
        validate={[maxLength(1500)]}
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
            <Button className="full-mobile">Cancel</Button>
          </Popconfirm>
          {userCanEdit && <RenderSubmitButton buttonText={props.title} disableOnClean={false} />}
        </div>
      )}
    </FormWrapper>
  );
};

export default UpdateNOWTierForm;
