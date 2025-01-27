import React, { FC, useState } from "react";
import { Col, Row, Space, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faClockRotateLeft } from "@fortawesome/pro-regular-svg-icons";
import { CheckCircleOutlined, CheckOutlined, ClockCircleOutlined } from "@ant-design/icons";
import CoreButton from "@mds/common/components/common/CoreButton";
import { IPermitCondition } from "@mds/common/interfaces/permits";
import { PERMIT_CONDITION_STATUS_CODE } from "@mds/common/constants/enums";
import { getConditionsWithRequirements } from "@mds/common/utils/helpers";

import { useDispatch } from "react-redux";
import { updatePermitCondition } from "@mds/common/redux/actionCreators/permitActionCreator";
import { openModal } from "@mds/common/redux/actions/modalActions";
import ComparePermitConditionHistoryModal from "./ComparePermitConditionHistoryModal";
import { usePermitConditions } from "./PermitConditionsContext";

interface PermitConditionStatusProps {
  condition: IPermitCondition;
  previousCondition?: IPermitCondition;
  isDisabled?: boolean;
  canEditPermitConditions?: boolean;
  permitAmendmentGuid: string;
  refreshData: () => Promise<void>;
}

export const PermitConditionStatus: FC<PermitConditionStatusProps> = ({
  condition,
  previousCondition,
  isDisabled,
  canEditPermitConditions = false,
  permitAmendmentGuid,
  refreshData,
}) => {

  const { mineGuid, permitGuid, latestAmendment, previousAmendment } = usePermitConditions();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompleteReview = async (values) => {
    setIsSubmitting(true);
    const payload = values.step
      ? {
        ...values,
        _step: values.step,
        permit_condition_status_code: PERMIT_CONDITION_STATUS_CODE.COM
      } : values;
    await dispatch(updatePermitCondition(values.permit_condition_guid, permitAmendmentGuid, payload));
    await refreshData();

  };

  const openConditionHistoryModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(
      openModal({
        props: {
          title: `Compare Conditions`,
          currentAmendmentCondition: condition,
          previousAmendmentCondition: previousCondition,
          mineGuid,
          permitGuid,
          latestAmendment,
          previousAmendment,
        },
        width: 2048,
        content: ComparePermitConditionHistoryModal,
      })
    );

  }

  const requirements = getConditionsWithRequirements([condition]);

  const dispatch = useDispatch();

  return <Col span={24}>
    <Row justify="space-between">
      <Space>
        {condition.permit_condition_status_code === PERMIT_CONDITION_STATUS_CODE.COM ?
          <Tag className="condition-tag" color="success" icon={<CheckCircleOutlined />}>Review Completed</Tag> :
          <Tag className="condition-tag" color="error" icon={<FontAwesomeIcon icon={faClockRotateLeft} className="margin-small--right" />}>Requires Review</Tag>
        }
        {requirements.length > 0 &&
          <Tag className="condition-tag" color="purple" icon={<FontAwesomeIcon className="margin-small--right" icon={faClipboard} />}>
            Has {requirements.length} report{requirements.length > 1 && "s"}
          </Tag>
        }
      </Space>

      <Col>
        <CoreButton type="default" onClick={openConditionHistoryModal} icon={<ClockCircleOutlined />}>View Changes</CoreButton>
        {
          canEditPermitConditions && condition.permit_condition_status_code !== PERMIT_CONDITION_STATUS_CODE.COM &&
          <CoreButton
            type="primary"
            disabled={isDisabled || isSubmitting}
            onClick={() => handleCompleteReview(condition)}
          >
            <CheckOutlined /> Complete Review
          </CoreButton>
        }
      </Col>
    </Row >
  </Col >
};
