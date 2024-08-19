import React, { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Col, Row, Typography } from "antd";
import FileOutlined from "@ant-design/icons/FileOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsToLine,
  faArrowsFromLine,
  faBarsStaggered,
} from "@fortawesome/pro-light-svg-icons";
import { getPermitConditionCategoryOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import PermitConditionLayer from "./PermitConditionLayer";
import { IPermitAmendment, IPermitCondition } from "@mds/common/interfaces/permits";
import { VIEW_MINE_PERMIT } from "@/constants/routes";
import ScrollSidePageWrapper from "@mds/common/components/common/ScrollSidePageWrapper";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import CoreButton from "@mds/common/components/common/CoreButton";

const { Title } = Typography;

interface PermitConditionProps {
  latestAmendment: IPermitAmendment;
}

const PermitConditions: FC<PermitConditionProps> = ({ latestAmendment }) => {
  const { isFeatureEnabled } = useFeatureFlag();
  // NOTE: probably also an associated permission
  const canEditPermitConditions = isFeatureEnabled(Feature.MODIFY_PERMIT_CONDITIONS);
  const { id, permitGuid } = useParams<{ id: string; permitGuid: string }>();
  const [isExpanded, setIsExpanded] = useState(false);
  const permitConditionCategoryOptions = useSelector(getPermitConditionCategoryOptions);

  const permitConditions = latestAmendment?.conditions;

  const permitConditionCategories = permitConditionCategoryOptions
    .map((cat) => {
      const conditions =
        permitConditions?.filter(
          (c) => c.condition_category_code === cat.condition_category_code
        ) ?? [];
      const title = cat.description.replace("Conditions", "").trim();
      return conditions.length > 0
        ? {
            href: cat.condition_category_code.toLowerCase(),
            title,
            conditions,
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
                          <PermitConditionLayer condition={sc} isExpanded={isExpanded} />
                        </Col>
                      ))}
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
