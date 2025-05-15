import React, { FC, useState } from "react";
import { Col, Row, Space, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faClockRotateLeft } from "@fortawesome/pro-regular-svg-icons";
import { CheckCircleOutlined, CheckOutlined, ClockCircleOutlined } from "@ant-design/icons";
import CoreButton from "@mds/common/components/common/CoreButton";
import { IMineReportPermitRequirement, IPermitCondition } from "@mds/common/interfaces/permits";
import { PERMIT_CONDITION_STATUS_CODE } from "@mds/common/constants/enums";
import { useAppDispatch } from "@mds/common/redux/rootState";
import { updatePermitCondition } from "@mds/common/redux/actionCreators/permitActionCreator";
import { openModal } from "@mds/common/redux/actions/modalActions";
import ComparePermitConditionHistoryModal from "@mds/common/components/permits/ComparePermitConditionHistoryModal";
import { PermitConditionsProvider, usePermitConditions } from "@mds/common/components/permits/PermitConditionsContext";

interface PermitConditionStatusProps {
  condition: IPermitCondition;
  requirements: IMineReportPermitRequirement[];
  previousCondition?: IPermitCondition;
  isDisabled?: boolean;
  canEditPermitConditions?: boolean;
  permitAmendmentGuid: string;
  refreshData: () => Promise<void>;
}

export const PermitConditionStatus: FC<PermitConditionStatusProps> = ({
  condition,
  requirements,
  previousCondition,
  isDisabled,
  canEditPermitConditions = false,
  permitAmendmentGuid,
  refreshData,
}) => {

  const { mineGuid, permitGuid, latestAmendment, previousAmendment, currentAmendment, loading, setLoading } = usePermitConditions();

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
        },
        width: 2048,
        content: (props) => {
          const value = { mineGuid, permitGuid, latestAmendment, previousAmendment, currentAmendment, loading, setLoading };
          return <PermitConditionsProvider value={value} > <ComparePermitConditionHistoryModal {...props} /></PermitConditionsProvider>;
        }
      })
    );
  }

  const dispatch = useAppDispatch();

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
        {previousCondition ? <CoreButton type="default" onClick={openConditionHistoryModal} icon={<ClockCircleOutlined />}>View Changes</CoreButton> : ""}
        {
          canEditPermitConditions && condition.permit_condition_status_code !== PERMIT_CONDITION_STATUS_CODE.COM &&
          <CoreButton
            loading={loading}
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
