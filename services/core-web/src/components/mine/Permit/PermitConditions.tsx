import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Col, Collapse, Row, Skeleton, Typography } from "antd";
import FileOutlined from "@ant-design/icons/FileOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsFromLine,
  faArrowsToLine,
  faBan,
  faBarsStaggered,
} from "@fortawesome/pro-light-svg-icons";
import { getPermitConditionCategoryOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import PermitConditionLayer from "./PermitConditionLayer";
import {
  IMineReportPermitRequirement,
  IPermitAmendment,
  IPermitCondition,
  IPermitConditionCategory,
} from "@mds/common/interfaces/permits";
import { VIEW_MINE_PERMIT } from "@/constants/routes";
import ScrollSidePageWrapper from "@mds/common/components/common/ScrollSidePageWrapper";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import CoreButton from "@mds/common/components/common/CoreButton";
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
import PermitConditionCategoryEditModal from "./PermitConditionCategoryEditModal";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { uniqBy } from "lodash";
import { createPermitAmendmentConditionCategory, deletePermitAmendmentConditionCategory, updatePermitAmendmentConditionCategory } from "@mds/common/redux/actionCreators/permitActionCreator";
import { EditPermitConditionCategoryInline } from "./PermitConditionCategory";
import { searchConditionCategories } from "@mds/common/redux/slices/permitConditionCategorySlice";

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
  const dispatch = useDispatch();
  const canEditPermitConditions = isFeatureEnabled(Feature.MODIFY_PERMIT_CONDITIONS) && userCanEdit;
  const { id: mineGuid, permitGuid } = useParams<{ id: string; permitGuid: string, mineGuid: string }>();
  const [isExpanded, setIsExpanded] = useState(false);

  const mineReportPermitRequirements: IMineReportPermitRequirement[] = useSelector(
    getMineReportPermitRequirements(permitGuid)
  );

  const permitConditions = latestAmendment?.conditions;
  const permitExtraction = useSelector(
    getPermitExtractionByGuid(latestAmendment?.permit_amendment_id)
  );

  useEffect(() => {
    dispatch(searchConditionCategories({}));
  }, []);

  const defaultPermitConditionCategories = useSelector(getPermitConditionCategoryOptions);
  const condWithoutConditionsText = defaultPermitConditionCategories?.map((cat) => {
    return {
      ...cat,
      description: cat.description.replace('Conditions', '').trim(),
    }
  });

  // @ts-ignore
  const isLoading = useSelector((state) => state.GET_PERMITS?.isFetching);

  const isExtractionInProgress =
    permitExtraction?.task_status === PermitExtractionStatus.in_progress;
  const isExtractionComplete = permitExtraction?.task_status === PermitExtractionStatus.complete;

  const permitConditionCategoryOptions: IPermitConditionCategory[] = uniqBy(latestAmendment?.condition_categories.concat(condWithoutConditionsText) ?? [], 'condition_category_code');

  const permitConditionCategories = permitConditionCategoryOptions
    .map((cat) => {
      const conditions =
        permitConditions?.filter(
          (c) => c.condition_category_code === cat.condition_category_code
        ) ?? [];

      const isDefaultConditionCategory = !!condWithoutConditionsText?.find(x => x.condition_category_code === cat.condition_category_code);

      if (!conditions.length && isDefaultConditionCategory) {
        return null;
      }

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
      }

      // Initialize the step paths for all top-level conditions
      const formattedConditions = conditions.map((condition) => getStepPath(condition));

      return {
        href: cat.condition_category_code.toLowerCase().replace('-', ''),
        icon: <FontAwesomeIcon icon={faBan} style={{ color: '#bbb', fontSize: '20px' }} />,
        title: <Typography.Text style={{ fontSize: '16px', fontWeight: '600' }}>{cat.step ? `${cat.step}. ` : ''}{cat.description}</Typography.Text>,
        titleText: cat.description,
        description: 'Not Started',
        conditions: formattedConditions || [],
        condition_category_code: cat.condition_category_code,
        condition_category: cat
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.condition_category.display_order - b.condition_category.display_order);
  const scrollSideMenuProps = {
    menuOptions: permitConditionCategories,
    featureUrlRoute: VIEW_MINE_PERMIT.hashRoute,
    featureUrlRouteArguments: [mineGuid, permitGuid, "conditions"],
  };

  const topOffset = 99 + 49; // header + tab nav

  const handleAddCondition = (newCondition: Partial<IPermitCondition>) => {
    console.log("not implemented", newCondition);
    return Promise.resolve();
  };

  const handleEditReportRequirement = (values) => {
    console.log("not implemented", values);
  };


  const openCreateCategoryModal = (event) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          title: `Add Condition Category`,
          handleSubmit: async (category) => {
            await dispatch(createPermitAmendmentConditionCategory(mineGuid, permitGuid, latestAmendment.permit_amendment_guid, {
              ...category,
              display_order: permitConditionCategories.length,
            }));

            dispatch(closeModal());
          },
        },
        content: PermitConditionCategoryEditModal,
      })
    );
  };

  const handleUpdateConditionCategory = (category: IPermitConditionCategory) => {
    dispatch(updatePermitAmendmentConditionCategory(mineGuid, permitGuid, latestAmendment.permit_amendment_guid, category));
  };

  const handleDeleteConditionCategory = (category: IPermitConditionCategory) => {
    dispatch(deletePermitAmendmentConditionCategory(mineGuid, permitGuid, latestAmendment.permit_amendment_guid, category.condition_category_code));
  };

  const handleMove = (category: IPermitConditionCategory, newOrder: number) => {
    const updatedCat = {
      ...category,
      display_order: newOrder
    }

    dispatch(updatePermitAmendmentConditionCategory(mineGuid, permitGuid, latestAmendment.permit_amendment_guid, updatedCat));
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

  const showLoading = !latestAmendment;

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

  const AddConditionModalContent = (
    <Typography.Paragraph className="no_link_styling grey" style={{ fontSize: '14px', textAlign: 'center' }}>
      {showLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
        <Typography.Link onClick={openCreateCategoryModal} className="fade-in">
          + Add Condition Category
        </Typography.Link>
      )}
    </Typography.Paragraph>
  );

  return (
    <ScrollSidePageWrapper
      header={null}
      headerHeight={topOffset}
      menuProps={scrollSideMenuProps}
      extraItems={AddConditionModalContent}
      view={"steps"}
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
                  disabled={showLoading}
                  type="tertiary"
                  className="fa-icon-container"
                  icon={<FontAwesomeIcon icon={isExpanded ? faArrowsToLine : faArrowsFromLine} />}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "Collapse" : "Expand"} All Conditions
                </CoreButton>
              </Col>
              <Col>
                <CoreButton type="tertiary" icon={<FileOutlined />} disabled={showLoading}>
                  Open Permit in Document Viewer
                </CoreButton>
              </Col>
            </Row>
          </Col>

          <Col>
            <CoreButton
              type="tertiary"
              className="fa-icon-container"
              disabled={showLoading}
              icon={<FontAwesomeIcon icon={faBarsStaggered} />}
            >
              Reorder
            </CoreButton>
          </Col>
          <Col span={24}>
            <div className="core-page-content">
              <Row gutter={[16, 16]}>
                {
                  showLoading && (
                    <Skeleton active paragraph={{ rows: 10 }} />
                  )
                }

                {permitConditionCategories.map((category, idx) => {
                  const conditionsWithRequirements: IPermitCondition[] =
                    getConditionsWithRequirements(category.conditions);
                  return (
                    <React.Fragment key={category.href}>
                      <Col span={24}>
                        <Row justify="space-between">
                          <Title level={3} className="margin-none" id={category.href}>
                            <EditPermitConditionCategoryInline
                              onDelete={handleDeleteConditionCategory}
                              onChange={handleUpdateConditionCategory}
                              moveUp={(cat) => handleMove(cat, idx - 1)}
                              moveDown={(cat) => handleMove(cat, idx + 1)}
                              currentPosition={idx}
                              categoryCount={permitConditionCategories.length}
                              category={category.condition_category}
                              conditionCount={category?.conditions.length || 0}
                            />
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
                        <Col span={24} key={sc.permit_condition_id} className="fade-in">
                          <PermitConditionLayer condition={sc} isExpanded={isExpanded} userCanEdit={userCanEdit} />
                        </Col>
                      ))}
                      {conditionsWithRequirements?.length > 0 && (
                        <div className="report-collapse-container ">
                          <Title level={4} className="primary-colour">
                            Report Requirements
                          </Title>
                          <Collapse expandIconPosition="end">
                            {conditionsWithRequirements.map((cond: IPermitCondition, index) => (
                              <Collapse.Panel
                                key={cond.permit_condition_id}
                                header={
                                  <Typography.Text strong>Report #{index + 1}{cond.mineReportPermitRequirement?.report_name ? ` - ${cond.mineReportPermitRequirement.report_name}` : ''}</Typography.Text>
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
      }>
    </ScrollSidePageWrapper>
  );
};

export default PermitConditions;
