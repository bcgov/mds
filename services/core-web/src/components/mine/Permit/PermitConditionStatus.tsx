import React, { FC } from "react";
import { Col, Row, Space, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faClockRotateLeft } from "@fortawesome/pro-regular-svg-icons";
import { CheckCircleOutlined, CheckOutlined } from "@ant-design/icons";
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

  const { mineGuid, permitGuid, latestAmendment } = usePermitConditions();

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

  const openConditionHistoryModal = () => {
    dispatch(
      openModal({
        props: {
          title: `Compare Conditions`,
          currentAmendmentCondition: condition,
          previousAmendmentCondition: previousCondition,
          mineGuid,
          permitGuid,
          latestAmendment
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

        <Tag className="View History" color="blue" icon={<FontAwesomeIcon className="margin-small--right" icon={faClipboard} />} onClick={openConditionHistoryModal}>View History</Tag>

      </Space>
      {
        canEditPermitConditions && condition.permit_condition_status_code !== PERMIT_CONDITION_STATUS_CODE.COM &&
        <CoreButton
          type="primary"
          disabled={isDisabled}
          onClick={() => handleCompleteReview(condition)}
        >
          <CheckOutlined /> Complete Review
        </CoreButton>
      }
    </Row >
  </Col >
};
