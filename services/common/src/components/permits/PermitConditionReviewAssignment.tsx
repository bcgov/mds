import React, { FC } from "react";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@mds/common/redux/rootState";
import { Button, Col, Popconfirm, Row, Typography } from "antd";
import { faCheck } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserSearchField from "@mds/common/components/common/UserSearchField";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import {
  assignReviewer,
  fetchReviewAssignments,
  getCategoryReviewAssignment,
  getPermitReviewAssignmentsIsLoaded,
  isUserAssignedToReviewCategory,
  unassignReviewer,
} from "@mds/common/redux/slices/permitConditionCategorySlice";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { faXmark } from "@fortawesome/pro-light-svg-icons";
import { IPermitConditionCategory } from "@mds/common/interfaces";
import { USER_ROLES } from "@mds/common/constants/environment";
import { FORM } from "@mds/common/constants/forms";
import { usePermitConditions } from "./PermitConditionsContext";

interface PermitConditionReviewAssignmentProps {
  category: IPermitConditionCategory;
}

const PermitConditionReviewAssignment: FC<PermitConditionReviewAssignmentProps> = ({
  category,
}) => {
  const { currentAmendment, loading } = usePermitConditions();
  const { permit_amendment_id } = currentAmendment;
  const reviewAssignment = useSelector(getCategoryReviewAssignment(permit_amendment_id, category.condition_category_code));
  const isUserAssigned = useSelector(isUserAssignedToReviewCategory(permit_amendment_id, category.condition_category_code));
  const assignmentsLoaded = useSelector(getPermitReviewAssignmentsIsLoaded(permit_amendment_id));
  const reviewer = reviewAssignment?.assigned_review_user;
  const isLoaded = !loading && assignmentsLoaded;

  const dispatch = useDispatch();
  const initialValues = { value: reviewer?.sub ?? "", label: reviewer?.display_name ?? "" }

  const userCanAssignReviewers = useSelector(
    userHasRole(USER_ROLES.role_edit_template_conditions)
  );

  const formName = `${FORM.PERMIT_CONDITION_REVIEW_ASSIGNMENT}-${category.condition_category_code}`;

  const refreshData = () => {
    dispatch(fetchReviewAssignments({ permit_amendment_id }));
  };

  const handleSubmit = (values) => {
    dispatch(assignReviewer({ permit_amendment_id, description: category.description, ...values })).then(() => {
      refreshData();
    });
  };

  const handleUnassign = () => {
    dispatch(unassignReviewer({
      permit_amendment_id,
      description: category.description,
      condition_review_assignment_guid: reviewAssignment?.condition_review_assignment_guid
    })).then(
      () => {
        refreshData();
      }
    );
  };

  return (
    <FormWrapper
      layout="horizontal"
      isEditMode={userCanAssignReviewers}
      scrollOnToggleEdit={false}
      name={formName}
      onSubmit={handleSubmit}
      reduxFormConfig={{ enableReinitialize: true }}
      initialValues={{
        assigned_review_user: initialValues.value,
        condition_category_code: category.condition_category_code,
      }}
    >
      <Row align="top" justify="start" gutter={16}
        className={`${isUserAssigned ? "" : "condition-category-reviewer-row"}`}
      >
        <Col>
          <Typography.Paragraph>Assigned Reviewer:</Typography.Paragraph>
        </Col>
        <Col span={12}>
          <UserSearchField
            disabled={!isLoaded}
            loading={!isLoaded}
            initialDataSource={reviewer ? [initialValues] : []}
            id={`assigned_review_user-${category.condition_category_code}`}
            name="assigned_review_user"
          />
        </Col>
        <Col>
          <RenderSubmitButton iconButton={true} icon={<FontAwesomeIcon icon={faCheck} />} />
          {reviewer && userCanAssignReviewers && (
            <Popconfirm
              title="Are you sure you want to unassign this reviewer?"
              onConfirm={handleUnassign}
              className={!isLoaded ? "form-btn" : ""}
            >
              <Button
                icon={<FontAwesomeIcon icon={faXmark} />}
                disabled={!isLoaded}
              />
            </Popconfirm>
          )}
        </Col>
      </Row>
    </FormWrapper>
  );
};

export default React.memo(PermitConditionReviewAssignment);
