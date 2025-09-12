import React, { FC, useEffect, useMemo } from "react";
import { Col, Collapse, Row, Skeleton, Typography } from "antd";
import {
  IFormattedConditionCategory,
  IPermitCondition,
  IStandardPermitCondition,
} from "@mds/common/interfaces";
import {
  createPermitCondition,
  fetchStandardPermitConditions,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import {
  getStandardPermitConditions,
  getStandardPermitConditionsFormatted,
} from "@mds/common/redux/selectors/permitSelectors";
import { getIsFetching } from "@mds/common/redux/reducers/networkReducer";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import CoreButton from "@mds/common/components/common/CoreButton";
import { LeftOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-light-svg-icons";

const { Text } = Typography;

interface PermitTemplateConditionManagerProps {
  category: IFormattedConditionCategory;
  typeCode: string;
  onInsert: () => void;
  onClose: () => void;
  permitAmendmentGuid: string;
}

const PermitTemplateConditionManager: FC<PermitTemplateConditionManagerProps> = ({
  category,
  typeCode,
  onInsert,
  permitAmendmentGuid,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  const { categoriesWithConditions } = useAppSelector(getStandardPermitConditionsFormatted());
  const standardPermitConditions = useAppSelector(getStandardPermitConditions);

  const conditionsLoading = useAppSelector(
    getIsFetching(NetworkReducerTypes.GET_PERMIT_CONDITIONS)
  );
  const conditionsLoaded =
    categoriesWithConditions[0]?.conditions[0]?.notice_of_work_type === typeCode;

  const templateConditions = useMemo(() => {
    if (!categoriesWithConditions) return [];
    return (
      categoriesWithConditions.find(
        (cat) => cat.condition_category_code === category.condition_category_code
      )?.conditions ?? []
    );
  }, [categoriesWithConditions, category.condition_category_code, standardPermitConditions]);

  useEffect(() => {
    if (!conditionsLoaded) {
      dispatch(fetchStandardPermitConditions(typeCode)).then(() => {});
    }
  }, [typeCode]);

  const handleInsert = async (condition: IStandardPermitCondition) => {
    const newCondition: IPermitCondition = {
      condition_category_code: condition.condition_category_code,
      condition_type_code: condition.condition_type_code,
      display_order: category.conditions.length + 1,
      condition: condition.condition,
      sub_conditions: condition.sub_conditions,
    } as unknown as IPermitCondition;
    await dispatch(createPermitCondition(permitAmendmentGuid, newCondition));
    onInsert();
  };

  const renderCloseButton = () => {
    return (
      <CoreButton
        data-testid="close-template-manager-button"
        type="primary"
        onClick={onClose}
        icon={<FontAwesomeIcon icon={faXmark} />}
      />
    );
  };

  if (conditionsLoading) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }

  if (templateConditions?.length === 0) {
    return (
      <div>
        <Typography.Title level={4}>Template Conditions</Typography.Title>
        <Typography.Text>No template conditions available for this category.</Typography.Text>
        {renderCloseButton()}
      </div>
    );
  }

  return (
    <div data-testid="permit-condition-template-manager">
      <Row wrap={false}>
        <Col flex="auto">
          <Typography.Title level={4}>Template Conditions</Typography.Title>
        </Col>
        <Col>{renderCloseButton()}</Col>
      </Row>
      <Collapse>
        {templateConditions.map((condition: IStandardPermitCondition) => (
          <Collapse.Panel
            key={condition.standard_permit_condition_guid}
            header={
              <Row wrap={false} data-testid="template-conditions-collapse">
                <Col flex="auto">
                  <Typography.Text strong>
                    {condition.condition.substring(0, 80)}
                    {condition.condition.length > 80 ? "..." : ""}
                  </Typography.Text>
                </Col>
                <Col>
                  <CoreButton
                    data-testid="template-insert-button"
                    icon={<LeftOutlined />}
                    type="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleInsert(condition);
                    }}
                  >
                    Insert Condition
                  </CoreButton>
                </Col>
              </Row>
            }
          >
            <Typography.Paragraph>{condition.condition}</Typography.Paragraph>

            {condition.sub_conditions && condition.sub_conditions.length > 0 && (
              <>
                <Typography.Text strong style={{ marginTop: "16px", display: "block" }}>
                  Sub Conditions:
                </Typography.Text>
                <Collapse>
                  {condition.sub_conditions.map((subCondition) => (
                    <Collapse.Panel
                      key={subCondition.standard_permit_condition_guid}
                      header={
                        <Text data-testid="sub-conditions-collapse">
                          {subCondition.condition.substring(0, 80) +
                            (subCondition.condition.length > 80 ? "..." : "")}
                        </Text>
                      }
                    >
                      <Typography.Paragraph>{subCondition.condition}</Typography.Paragraph>
                    </Collapse.Panel>
                  ))}
                </Collapse>
              </>
            )}
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default PermitTemplateConditionManager;
