import React, { FC } from "react";
import { Col, Row, Space, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/pro-light-svg-icons";
import { CheckCircleOutlined, RedoOutlined, CheckOutlined } from "@ant-design/icons";
import CoreButton from "@mds/common/components/common/CoreButton";
import { IPermitCondition, PERMIT_CONDITION_STATUS_CODE } from "@mds/common";
import { useDispatch } from "react-redux";
import { updatePermitCondition } from "@mds/common/redux/actionCreators/permitActionCreator";

interface PermitConditionStatusProps {
  condition: IPermitCondition;
  isDisabled?: boolean;
  canEditPermitConditions?: boolean;
  permitAmendmentGuid: string;
  refreshData: () => Promise<void>;
}

export const PermitConditionStatus: FC<PermitConditionStatusProps> = ({
  condition,
  isDisabled,
  canEditPermitConditions = false,
  permitAmendmentGuid,
  refreshData,
}) => {

  const handleCompleteReview = async (values) => {
    const payload = values.step
        ? {
            ...values,
            _step: values.step,
            permit_condition_status_code: PERMIT_CONDITION_STATUS_CODE.COM
        } : values;
    await dispatch(updatePermitCondition(values.permit_condition_guid, permitAmendmentGuid, payload));
    await refreshData();
  };

  const getConditionsWithRequirements = (conditions: IPermitCondition[]) => {
    let result = [];
    conditions.forEach((condition) => {
      if (condition.mineReportPermitRequirement) {
        result.push(condition);
      }

      if (condition.sub_conditions && condition.sub_conditions.length > 0) {
        result = result.concat(getConditionsWithRequirements(condition.sub_conditions));
      }
    });
    return result;
  };

  const requirements = getConditionsWithRequirements([condition]);
  
  const dispatch = useDispatch();

  return <Col span={24}>
    <Row justify="space-between"> 
      <Space>
        { condition.permit_condition_status_code === PERMIT_CONDITION_STATUS_CODE.COM ? 
          <Tag className="condition-tag" color="success" icon={<CheckCircleOutlined/>}>Review Completed</Tag> :
          <Tag className="condition-tag" color="error" icon={<RedoOutlined />}>Needs Review</Tag>
        }
        { requirements.length > 0 && 
          <Tag className="condition-tag" color="purple" icon={<FontAwesomeIcon className="margin-small--right" icon={faClipboard}/>}>
            Has {requirements.length} report{requirements.length > 1 && "s"}
          </Tag>
        }
      </Space>
      { canEditPermitConditions && condition.permit_condition_status_code !== PERMIT_CONDITION_STATUS_CODE.COM &&            
        <CoreButton
          type="primary"
          disabled={isDisabled}
          onClick={() => handleCompleteReview(condition)}
        >
          <CheckOutlined /> Complete Review
        </CoreButton>
      }
      </Row>
  </Col>
};
