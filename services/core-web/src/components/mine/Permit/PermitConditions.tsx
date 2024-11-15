import React, { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Col, Collapse, Row, Typography } from "antd";
import FileOutlined from "@ant-design/icons/FileOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsFromLine,
  faArrowsToLine,
  faBarsStaggered,
} from "@fortawesome/pro-light-svg-icons";
import { getPermitConditionCategoryOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import PermitConditionLayer from "./PermitConditionLayer";
import {
  IMineReportPermitRequirement,
  IPermitAmendment,
  IPermitCondition,
} from "@mds/common/interfaces/permits";
import { VIEW_MINE_PERMIT } from "@/constants/routes";
import ScrollSidePageWrapper from "@mds/common/components/common/ScrollSidePageWrapper";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import CoreButton from "@mds/common/components/common/CoreButton";
import { LoadingOutlined } from "@ant-design/icons";
import {
  getPermitExtractionByGuid,
  PermitExtractionStatus,
} from "@mds/common/redux/slices/permitServiceSlice";
import {
  RenderExtractionError,
  RenderExtractionProgress,
  RenderExtractionStart,
} from "./PermitConditionExtraction";
import { getMineReportPermitRequirements } from "@mds/common/redux/selectors/permitSelectors";
import ReportPermitRequirementForm from "@/components/Forms/reports/ReportPermitRequirementForm";

const { Title } = Typography;

interface PermitConditionProps {
  latestAmendment: IPermitAmendment;
  canStartExtraction: boolean;
  userCanEdit: boolean;
}

const PermitConditions: FC<PermitConditionProps> = ({
  latestAmendment,
  canStartExtraction,
  userCanEdit,
}) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const canEditPermitConditions = isFeatureEnabled(Feature.MODIFY_PERMIT_CONDITIONS) && userCanEdit;
  const { id, permitGuid } = useParams<{ id: string; permitGuid: string }>();
  const [isExpanded, setIsExpanded] = useState(false);
  const permitConditionCategoryOptions = useSelector(getPermitConditionCategoryOptions);
  const mineReportPermitRequirements: IMineReportPermitRequirement[] = useSelector(
    getMineReportPermitRequirements(permitGuid)
  );

  const permitConditions = latestAmendment?.conditions;
  const permitExtraction = useSelector(
    getPermitExtractionByGuid(latestAmendment?.permit_amendment_id)
  );

  // @ts-ignore
  const isLoading = useSelector((state) => state.GET_PERMITS?.isFetching);

  const isExtractionInProgress =
    permitExtraction?.task_status === PermitExtractionStatus.in_progress;
  const isExtractionComplete = permitExtraction?.task_status === PermitExtractionStatus.complete;

  const permitConditionCategories = permitConditionCategoryOptions
    .map((cat) => {
      const conditions =
        permitConditions?.filter(
          (c) => c.condition_category_code === cat.condition_category_code
        ) ?? [];

      // Recursive function to get the full path of steps
      const getStepPath = (condition, parentPath = ""): IPermitCondition => {
        const currentPath = parentPath
          ? `${parentPath}${condition.step}`
          : `${cat.description} - ${condition.step}`;
        const stepPath = currentPath.replace(/\.+$/, "");

        const mineReportPermitRequirement = mineReportPermitRequirements.find(
          (requirement) => requirement.permit_condition_id === condition.permit_condition_id
        );

        // If condition has sub-conditions, recursively add step paths
        const sub_conditions =
          condition.sub_conditions?.map((subCondition) => getStepPath(subCondition, currentPath)) ??
          [];

        return {
          ...condition,
          stepPath,
          mineReportPermitRequirement,
          sub_conditions,
        };
      };

      // Initialize the step paths for all top-level conditions
      const formattedConditions = conditions.map((condition) => getStepPath(condition));

      const title = cat.description.replace("Conditions", "").trim();
      return formattedConditions.length > 0
        ? {
            href: cat.condition_category_code.toLowerCase(),
            title,
            conditions: formattedConditions,
            condition_category_code: cat.condition_category_code,
          }
        : false;
    })
    .filter(Boolean);

  const scrollSideMenuProps = {
    menuOptions: permitConditionCategories,
    featureUrlRoute: VIEW_MINE_PERMIT.hashRoute,
    featureUrlRouteArguments: [id, permitGuid, "conditions"],
  };

  const topOffset = 99 + 49; // header + tab nav

  const handleAddCondition = (newCondition: Partial<IPermitCondition>) => {
    console.log("not implemented", newCondition);
    return Promise.resolve();
  };

  const handleEditReportRequirement = (values) => {
    console.log("not implemented", values);
  };

  if (isLoading) {
    return <LoadingOutlined style={{ fontSize: 120 }} />;
  }

  if (isExtractionInProgress) {
    return <RenderExtractionProgress />;
  }
  if (!isExtractionComplete && permitExtraction?.task_status === "Error Extracting") {
    return <RenderExtractionError />;
  }
  if (canStartExtraction) {
    return <RenderExtractionStart />;
  }

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

  return (
    <ScrollSidePageWrapper
      header={null}
      headerHeight={topOffset}
      menuProps={scrollSideMenuProps}
      content={
        <Row align="middle" justify="space-between" gutter={[10, 16]}>
          <Col span={24}>
            <Title className="margin-none" level={2}>
              Permit Conditions
            </Title>
          </Col>

          <Col>
            <Row gutter={10}>
              <Col>
                <CoreButton
                  type="tertiary"
                  className="fa-icon-container"
                  icon={<FontAwesomeIcon icon={isExpanded ? faArrowsToLine : faArrowsFromLine} />}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "Collapse" : "Expand"} All Conditions
                </CoreButton>
              </Col>
              <Col>
                <CoreButton type="tertiary" icon={<FileOutlined />}>
                  Open Permit in Document Viewer
                </CoreButton>
              </Col>
            </Row>
          </Col>

          <Col>
            <CoreButton
              type="tertiary"
              className="fa-icon-container"
              icon={<FontAwesomeIcon icon={faBarsStaggered} />}
            >
              Reorder
            </CoreButton>
          </Col>
          <Col span={24}>
            <div className="core-page-content">
              <Row gutter={[16, 16]}>
                {permitConditionCategories.map((category) => {
                  const conditionsWithRequirements: IPermitCondition[] =
                    getConditionsWithRequirements(category.conditions);
                  return (
                    <React.Fragment key={category.href}>
                      <Col span={24}>
                        <Row justify="space-between">
                          <Title level={3} className="margin-none" id={category.href}>
                            {category.title} ({category.conditions.length})
                          </Title>
                          {canEditPermitConditions && (
                            <CoreButton
                              type="primary"
                              onClick={() =>
                                handleAddCondition({
                                  condition_category_code: category.condition_category_code,
                                })
                              }
                            >
                              Add Condition
                            </CoreButton>
                          )}
                        </Row>
                      </Col>
                      {category.conditions.map((sc) => (
                        <Col span={24} key={sc.permit_condition_id}>
                          <PermitConditionLayer condition={sc} isExpanded={isExpanded} userCanEdit={userCanEdit}/>
                        </Col>
                      ))}
                      {conditionsWithRequirements?.length > 0 && (
                        <div className="report-collapse-container">
                          <Title level={4} className="primary-colour">
                            Report Requirements
                          </Title>
                          <Collapse expandIconPosition="end">
                            {conditionsWithRequirements.map((cond: IPermitCondition, index) => (
                              <Collapse.Panel
                                key={cond.permit_condition_id}
                                header={
                                  <Typography.Text strong>Report #{index + 1}</Typography.Text>
                                }
                                className="report-collapse"
                              >
                                <ReportPermitRequirementForm
                                  modalView={false}
                                  onSubmit={handleEditReportRequirement}
                                  condition={cond}
                                  permitGuid={permitGuid}
                                  mineReportPermitRequirement={cond.mineReportPermitRequirement}
                                />
                              </Collapse.Panel>
                            ))}
                          </Collapse>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </Row>
            </div>
          </Col>
        </Row>
      }
    />
  );
};

export default PermitConditions;
