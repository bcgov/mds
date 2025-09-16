import React, { FC, useEffect, useMemo, useState } from "react";
import { Col, Collapse, Row, Skeleton, Typography } from "antd";
import { IFormattedConditionCategory, IStandardPermitCondition } from "@mds/common/interfaces";
import { fetchStandardPermitConditions } from "@mds/common/redux/actionCreators/permitActionCreator";
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
import { postTemplateConditionToAmendment } from "@mds/common/redux/slices/permitConditionTemplateSlice";
import { usePermitConditions } from "@mds/common/components/permits/PermitConditionsContext";

const { Text } = Typography;

interface PermitTemplateConditionManagerProps {
  category: IFormattedConditionCategory;
  onInsert: () => void;
  onClose: () => void;
  permitAmendmentGuid: string;
}

const PermitTemplateConditionManager: FC<PermitTemplateConditionManagerProps> = ({
  category,
  onInsert,
  permitAmendmentGuid,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  const { standardConditionType } = usePermitConditions();

  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [activeSubKeys, setActiveSubKeys] = useState<Record<string, string[]>>({});

  const { categoriesWithConditions } = useAppSelector(getStandardPermitConditionsFormatted());
  const standardPermitConditions = useAppSelector(getStandardPermitConditions);

  const conditionsLoading = useAppSelector(
    getIsFetching(NetworkReducerTypes.GET_PERMIT_CONDITIONS)
  );

  useEffect(() => {
    if (!conditionsLoaded) {
      dispatch(fetchStandardPermitConditions(standardConditionType));
    }
  }, [standardConditionType]);

  const conditionsLoaded =
    categoriesWithConditions[0]?.conditions[0]?.notice_of_work_type === standardConditionType;

  const templateConditions = useMemo(() => {
    if (!categoriesWithConditions) return [];
    return (
      categoriesWithConditions.find(
        (cat) => cat.condition_category_code === category.condition_category_code
      )?.conditions ?? []
    );
  }, [categoriesWithConditions, category.condition_category_code, standardPermitConditions]);

  const handleCollapseChange = (keys: string | string[]) => {
    setActiveKeys(Array.isArray(keys) ? keys : [keys]);
  };

  const handleSubCollapseChange = (parentKey: string) => (keys: string | string[]) => {
    setActiveSubKeys({
      ...activeSubKeys,
      [parentKey]: Array.isArray(keys) ? keys : [keys],
    });
  };

  const handleInsert = async (condition: IStandardPermitCondition) => {
    dispatch(
      postTemplateConditionToAmendment({
        permitAmendmentGuid,
        standardPermitConditionGuid: condition.standard_permit_condition_guid,
      })
    );
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

  const renderConditionText = (condition: IStandardPermitCondition, isExpanded: boolean) => {
    if (isExpanded) return condition.condition;
    return `${condition.condition.substring(0, 80)}${condition.condition.length > 80 ? "..." : ""}`;
  };

  const renderSubConditions = (
    subConditions: IStandardPermitCondition[],
    parentConditionKey: string
  ) => {
    return (
      <>
        <Typography.Text strong style={{ marginTop: "16px", display: "block" }}>
          Sub Conditions:
        </Typography.Text>
        <Collapse
          activeKey={activeSubKeys[parentConditionKey] || []}
          onChange={handleSubCollapseChange(parentConditionKey)}
        >
          {subConditions.map((subCondition) => {
            const subKey = subCondition.standard_permit_condition_guid;
            const isSubExpanded = activeSubKeys[parentConditionKey]?.includes(subKey);

            return (
              <Collapse.Panel
                key={subCondition.standard_permit_condition_guid}
                header={
                  <Text data-testid="sub-conditions-collapse">
                    {renderConditionText(subCondition, isSubExpanded)}
                  </Text>
                }
              >
                {subCondition?.sub_conditions?.length > 0 &&
                  renderSubConditions(subCondition.sub_conditions, subKey)}
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </>
    );
  };

  return (
    <div data-testid="permit-condition-template-manager">
      <Row wrap={false}>
        <Col flex="auto">
          <Typography.Title level={4}>Template Conditions</Typography.Title>
        </Col>
        <Col>{renderCloseButton()}</Col>
      </Row>
      <Collapse activeKey={activeKeys} onChange={handleCollapseChange}>
        {templateConditions.map((condition: IStandardPermitCondition) => {
          const conditionKey = condition.standard_permit_condition_guid;
          const isExpanded = activeKeys.includes(conditionKey);

          return (
            <Collapse.Panel
              key={conditionKey}
              header={
                <Row wrap={false} data-testid="template-conditions-collapse" gutter={16}>
                  <Col flex="auto">
                    <Typography.Text strong>
                      {renderConditionText(condition, isExpanded)}
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
                      Insert
                    </CoreButton>
                  </Col>
                </Row>
              }
            >
              {condition?.sub_conditions?.length > 0 &&
                renderSubConditions(condition.sub_conditions, conditionKey)}
            </Collapse.Panel>
          );
        })}
      </Collapse>
    </div>
  );
};

export default PermitTemplateConditionManager;
