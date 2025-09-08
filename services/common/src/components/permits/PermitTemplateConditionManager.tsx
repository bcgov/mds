import React, { FC, useEffect, useMemo } from "react";
import { Collapse, Typography, Row, Col, Skeleton } from "antd";
import { IFormattedConditionCategory, IStandardPermitCondition } from "@mds/common/interfaces";
import { fetchStandardPermitConditions } from "@mds/common/redux/actionCreators/permitActionCreator";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getStandardPermitConditionsFormatted } from "@mds/common/redux/selectors/permitSelectors";
import {
  fetchStandardReportRequirements,
  getStandardReportRequirements,
} from "@mds/common/redux/slices/mineReportPermitRequirementSlice";
import { getIsFetching } from "@mds/common/redux/reducers/networkReducer";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import CoreButton from "@mds/common/components/common/CoreButton";

interface PermitTemplateConditionManagerProps {
  category: IFormattedConditionCategory;
  typeCode: string;
  onInsert: ({
    category,
    condition,
  }: {
    category: IFormattedConditionCategory;
    condition: IStandardPermitCondition;
  }) => void;
}

const PermitTemplateConditionManager: FC<PermitTemplateConditionManagerProps> = ({
  category,
  typeCode,
  onInsert,
}) => {
  const dispatch = useAppDispatch();

  const { categoriesWithConditions } = useAppSelector(getStandardPermitConditionsFormatted());
  const reportRequirements = useAppSelector(getStandardReportRequirements);
  const conditionsLoading = useAppSelector(
    getIsFetching(NetworkReducerTypes.GET_PERMIT_CONDITIONS)
  );
  const conditionsLoaded =
    categoriesWithConditions[0]?.conditions[0]?.notice_of_work_type === typeCode;

  const templateConditions = useMemo(() => {
    if (!reportRequirements) return [];
    return (
      categoriesWithConditions.find(
        (cat) => cat.condition_category_code === category.condition_category_code
      )?.conditions ?? []
    );
  }, [reportRequirements, categoriesWithConditions, category.condition_category_code]);

  useEffect(() => {
    if (!conditionsLoaded) {
      dispatch(fetchStandardPermitConditions(typeCode)).then(() => {});
    }
  }, [typeCode]);

  useEffect(() => {
    if (!reportRequirements) {
      dispatch(fetchStandardReportRequirements(undefined));
    }
  }, [reportRequirements]);

  if (conditionsLoading) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }

  if (templateConditions?.length === 0) {
    return (
      <div>
        <Typography.Title level={4}>Template Conditions</Typography.Title>
        <Typography.Text>No template conditions available for this category.</Typography.Text>
      </div>
    );
  }

  return (
    <div>
      <Typography.Title level={4}>Template Conditions</Typography.Title>
      <Collapse className="template-conditions-collapse">
        {templateConditions.map((condition: IStandardPermitCondition) => (
          <Collapse.Panel
            key={condition.standard_permit_condition_guid}
            header={
              <Row>
                <Col flex="auto">
                  <Typography.Text strong>
                    {condition.condition.substring(0, 80)}
                    {condition.condition.length > 80 ? "..." : ""}
                  </Typography.Text>
                </Col>
                <Col>
                  <CoreButton
                    type="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      onInsert({
                        category,
                        condition,
                      });
                    }}
                  >
                    Insert Condition
                  </CoreButton>
                </Col>
              </Row>
            }
          >
            <Typography.Paragraph>{condition.condition}</Typography.Paragraph>

            {condition.condition_type_code && (
              <Row gutter={[8, 8]}>
                <Col span={8}>
                  <Typography.Text strong>Type:</Typography.Text>
                </Col>
                <Col span={16}>
                  <Typography.Text>{condition.condition_type_code}</Typography.Text>
                </Col>
              </Row>
            )}

            {condition.sub_conditions && condition.sub_conditions.length > 0 && (
              <>
                <Typography.Text strong style={{ marginTop: "16px", display: "block" }}>
                  Sub Conditions:
                </Typography.Text>
                <Collapse className="sub-conditions-collapse">
                  {condition.sub_conditions.map((subCondition) => (
                    <Collapse.Panel
                      key={subCondition.standard_permit_condition_guid}
                      header={
                        subCondition.condition.substring(0, 80) +
                        (subCondition.condition.length > 80 ? "..." : "")
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
