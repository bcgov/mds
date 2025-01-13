import React, { FC, useEffect, useState } from "react";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { FORM, IPermitConditionCategory, USER_ROLES } from "@mds/common";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Popconfirm, Row, Typography } from "antd";
import { faCheck } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserSearchField from "@/components/common/UserSearchField";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import {
  assignReviewer,
  unassignReviewer,
} from "@mds/common/redux/slices/permitConditionCategorySlice";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { faXmark } from "@fortawesome/pro-light-svg-icons";
import { getUser } from "@mds/common/redux/slices/userSlice";

interface PermitConditionReviewAssignmentProps {
  category: IPermitConditionCategory;
  refreshData: () => Promise<void>;
}

const PermitConditionReviewAssignment: FC<PermitConditionReviewAssignmentProps> = ({
  category,
  refreshData,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const [assignedReviewUserInitialValues, setAssignedReviewUserIntitialValues] = useState<
    | [
        {
          label: string;
          value: string;
        },
      ]
    | undefined
  >(
    category?.assigned_review_user?.sub
      ? [
          {
            value: category?.assigned_review_user?.sub || "",
            label: category?.assigned_review_user?.display_name || "",
          },
        ]
      : undefined
  );

  const userCanAssignReviewers = useSelector((state) =>
    userHasRole(state, USER_ROLES.role_edit_template_conditions)
  );

  const userCanUnassignReviewer =
    user?.sub === category?.assigned_review_user?.sub || userCanAssignReviewers;

  const formName = `${FORM.PERMIT_CONDITION_REVIEW_ASSIGNMENT}}-${category.condition_category_code}`;

  const handleSubmit = (values) => {
    // @ts-ignore
    dispatch(assignReviewer(values)).then(() => {
      refreshData();
    });
  };

  const handleUnassign = () => {
    // @ts-ignore
    dispatch(unassignReviewer({ condition_category_code: category.condition_category_code })).then(
      () => {
        setAssignedReviewUserIntitialValues(undefined);
        refreshData();
      }
    );
  };

  useEffect(() => {
    if (category?.assigned_review_user?.sub) {
      setAssignedReviewUserIntitialValues([
        {
          value: category?.assigned_review_user?.sub,
          label: category?.assigned_review_user?.display_name,
        },
      ]);
    }
  }, [category?.assigned_review_user?.sub]);

  return (
    <FormWrapper
      layout="horizontal"
      scrollOnToggleEdit={false}
      name={formName}
      onSubmit={handleSubmit}
      reduxFormConfig={{ enableReinitialize: true }}
      initialValues={{
        assigned_review_user: assignedReviewUserInitialValues?.[0]?.value ?? null,
        condition_category_code: category.condition_category_code,
      }}
    >
      <Row align="top" justify="start" gutter={16}>
        <Col>
          <Typography.Paragraph>Assigned Reviewer</Typography.Paragraph>
        </Col>
        <Col span={12}>
          <UserSearchField
            disabled={!userCanAssignReviewers}
            initialDataSource={assignedReviewUserInitialValues}
            id="assigned_review_user"
            name="assigned_review_user"
          />
        </Col>
        <Col>
          <RenderSubmitButton iconButton={true} icon={<FontAwesomeIcon icon={faCheck} />} />
          {!!category.assigned_review_user?.display_name && (
            <Popconfirm
              title="Are you sure you want to unassign this reviewer?"
              onConfirm={handleUnassign}
            >
              <Button
                icon={<FontAwesomeIcon icon={faXmark} />}
                disabled={!userCanUnassignReviewer}
              />
            </Popconfirm>
          )}
        </Col>
      </Row>
    </FormWrapper>
  );
};

export default PermitConditionReviewAssignment;
