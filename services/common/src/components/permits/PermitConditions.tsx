import React, { FC, useMemo, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Col, Row, Space, Typography } from "antd";
import FileOutlined from "@ant-design/icons/FileOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsFromLine,
  faArrowsToLine,
  faBan,
  faCheckCircle,
  faClock,
} from "@fortawesome/pro-light-svg-icons";
import { getPermitConditionCategoryOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import {
  IPermitAmendment,
  IPermitCondition,
  IPermitConditionCategory,
} from "@mds/common/interfaces/permits";
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
} from "@mds/common/components/permits/PermitConditionExtraction";
import { getPermitConditionCategories } from "@mds/common/redux/selectors/permitSelectors";
import PermitConditionCategoryEditModal from "@mds/common/components/permits/PermitConditionCategoryEditModal";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import {
  createPermitAmendmentConditionCategory,
  deletePermitAmendmentConditionCategory,
  fetchPermits,
  updatePermitAmendmentConditionCategory,
  updatePermitCondition,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { EditPermitConditionCategoryInline } from "@mds/common/components/permits/PermitConditionCategory";
import {
  fetchReviewAssignments,
  getReviewAssignmentsByAmendment,
  getUserReviewAssignmentsByAmendment,
  searchConditionCategories,
} from "@mds/common/redux/slices/permitConditionCategorySlice";
import { PreviewPermitAmendmentDocument } from "@mds/common/components/permits/PreviewPermitAmendmentDocument";
import { formatPermitConditionStep } from "@mds/common/utils/helpers";
import SubConditionForm from "@mds/common/components/permits/SubConditionForm";
import { getIsFetching } from "@mds/common/redux/reducers/networkReducer";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import PermitConditionReviewAssignment from "@mds/common/components/permits/PermitConditionReviewAssignment";
import { PERMIT_CONDITION_STATUS_CODE } from "@mds/common/constants/enums";
import { PermitReviewBanner } from "@mds/common/components/permits/PermitReviewBanner";
import { PermitConditionsProvider } from "@mds/common/components/permits/PermitConditionsContext";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { createDropDownList } from "@mds/common/redux/utils/helpers";
import PermitConditionLayer from "@mds/common/components/permits/PermitConditionLayer";
import { LatestAmendmentWarning } from "./LatestAmendmentWarning";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";

const { Title } = Typography;

interface PermitConditionProps {
  latestAmendment: IPermitAmendment;
  previousAmendment: IPermitAmendment;
  isReviewComplete: boolean;
  isExtracted: boolean;
  currentAmendment: IPermitAmendment;
  canStartExtraction: boolean;
  userCanEdit: boolean;
  permitGuid?: string;
  mineGuid?: string;
  forceViewConditions?: boolean;
  permitAmendmentDocumentGuid?: string;
  selectedConditionId?: string; // Add this line
}

const scrollToCondition = (selectedConditionId: string) => {
  // Add a small delay to ensure the DOM is fully rendered
  setTimeout(() => {
    const element = document.getElementById(`condition-${selectedConditionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight-condition");
      setTimeout(() => {
        element.classList.remove("highlight-condition");
      }, 20000);
    }
  }, 100);
};

const renderExtractionState = (
  isViewingLatestAmendment: boolean,
  isExtractionInProgress: boolean,
  isExtractionComplete: boolean,
  canStartExtraction: boolean,
  permitExtraction: any
) => {
  if (!isViewingLatestAmendment) return null;

  if (isExtractionInProgress) {
    return <RenderExtractionProgress />;
  }

  if (!isExtractionComplete && permitExtraction?.task_status === "Error Extracting") {
    return <RenderExtractionError />;
  }

  if (canStartExtraction) {
    return <RenderExtractionStart />;
  }

  return null;
};

const PermitConditions: FC<PermitConditionProps> = ({
  isReviewComplete,
  isExtracted,
  latestAmendment,
  currentAmendment,
  previousAmendment,
  canStartExtraction,
  userCanEdit,
  permitGuid,
  mineGuid,
  forceViewConditions,
  permitAmendmentDocumentGuid,
  selectedConditionId, // Add this line
}) => {
  const isCore = useAppSelector(getIsCore);
  const { isFeatureEnabled } = useFeatureFlag();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { id: mineGuidParam, permitGuid: permitGuidParam } = useParams<{
    id: string;
    permitGuid: string;
    mineGuid: string;
  }>();

  mineGuid = mineGuid ?? mineGuidParam;
  permitGuid = permitGuid ?? permitGuidParam;

  const pdfSplitViewEnabled = isFeatureEnabled(Feature.PERMIT_CONDITIONS_PDF_SPLIT_VIEW);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewPdf, setViewPdf] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<IPermitCondition | null>(null);
  const [editingConditionGuid, setEditingConditionGuid] = useState<string>();
  const [addingToCategoryCode, setAddingToCategoryCode] = useState<string>();
  const [loading, setLoading] = useState(false);

  const reviewAssignments = useAppSelector(
    getReviewAssignmentsByAmendment(currentAmendment.permit_amendment_id)
  );
  const userReviewAssignments = useAppSelector(
    useMemo(
      () => getUserReviewAssignmentsByAmendment(currentAmendment.permit_amendment_id),
      [currentAmendment.permit_amendment_id]
    )
  );

  const permitsLoading = useAppSelector(getIsFetching(NetworkReducerTypes.GET_PERMITS));
  const showLoading = permitsLoading || loading;

  const permitExtraction = useAppSelector(
    getPermitExtractionByGuid(currentAmendment?.permit_amendment_id)
  );

  const userReviewCategoryCodes = userReviewAssignments.map(
    (assignment) => assignment.condition_category_code
  );

  const canEditPermitConditions = (category: IPermitConditionCategory): boolean =>
    isFeatureEnabled(Feature.MODIFY_PERMIT_CONDITIONS) &&
    userCanEdit &&
    userReviewCategoryCodes.includes(category.condition_category_code);

  const refreshData = async () => {
    await dispatch(fetchPermits(mineGuid));
    setEditingConditionGuid(null);
  };

  useEffect(() => {
    dispatch(searchConditionCategories({}));
    dispatch(fetchReviewAssignments({ permit_amendment_id: currentAmendment.permit_amendment_id }));
  }, []);

  const defaultPermitConditionCategories = useAppSelector(getPermitConditionCategoryOptions);
  const condWithoutConditionsText = defaultPermitConditionCategories?.map((cat) => {
    return {
      ...cat,
      description: cat.description.replace("Conditions", "").trim(),
    };
  });

  const isExtractionInProgress =
    permitExtraction?.task_status === PermitExtractionStatus.in_progress;
  const isExtractionComplete = permitExtraction?.task_status === PermitExtractionStatus.complete;

  const PERMIT_CONDITION_STATUS = {
    complete: { icon: faCheckCircle, color: "color-success", text: "Complete" },
    in_progress: { icon: faClock, color: "color-primary", text: "In Progress" },
    not_started: { icon: faBan, color: "color-gov-grey", text: "Not Started" },
  };

  const getFormattedPermitConditionCategories = ({ categoriesWithConditions }) => {
    return categoriesWithConditions
      .map((cat) => {
        const category = {
          href: cat.condition_category_code.toLowerCase().replace("-", ""),
          titleText: cat.description,
          conditions: cat.conditions,
          condition_category_code: cat.condition_category_code,
          condition_category: cat,
        };
        const categoryTitle = `${formatPermitConditionStep(cat.step)} ${cat.description}`;
        if (isReviewComplete) {
          return {
            ...category,
            title: (
              <Typography.Text style={{ fontSize: "16px", fontWeight: "600" }}>
                {categoryTitle}
              </Typography.Text>
            ),
          };
        }
        //Set the text and icon based on the Status of all the top level conditions
        const statuses = cat.conditions.map((con) => con.permit_condition_status_code);
        const allComplete = statuses.every((s) => s === PERMIT_CONDITION_STATUS_CODE.COM);
        const someComplete = statuses.some((s) => s === PERMIT_CONDITION_STATUS_CODE.COM);

        let status = PERMIT_CONDITION_STATUS.not_started;
        if (allComplete) {
          status = PERMIT_CONDITION_STATUS.complete;
        } else if (someComplete) {
          status = PERMIT_CONDITION_STATUS.in_progress;
        }

        const reviewAssignment = reviewAssignments.find(
          (assignment) => assignment.condition_category_code === category.condition_category_code
        );
        const assigned_review_user = reviewAssignment?.assigned_review_user;

        return {
          ...category,
          icon: (
            <FontAwesomeIcon
              icon={status.icon}
              className={status.color}
              style={{ fontSize: "20px" }}
            />
          ),
          title: (
            <Typography.Text style={{ fontSize: "16px", fontWeight: "600" }}>
              {categoryTitle}
            </Typography.Text>
          ),
          description: (
            <Space direction="vertical">
              <Typography.Text>{status.text}</Typography.Text>
              <Typography.Text className="faded-text">
                {assigned_review_user?.display_name
                  ? "Assigned to " + assigned_review_user.display_name
                  : "Not Assigned"}
              </Typography.Text>
            </Space>
          ),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.condition_category.display_order - b.condition_category.display_order);
  };

  const permitConditionCategories = useAppSelector(
    getPermitConditionCategories(permitGuid, currentAmendment?.permit_amendment_guid)
  );
  const formattedPermitConditionCategories = useMemo(
    () => getFormattedPermitConditionCategories(permitConditionCategories),
    [permitGuid, currentAmendment]
  );

  const scrollSideMenuProps = {
    menuOptions: formattedPermitConditionCategories,
    featureUrlRoute: GLOBAL_ROUTES.VIEW_MINE_PERMIT_AMENDMENT.hashRoute,
    featureUrlRouteArguments: [
      mineGuid,
      permitGuid,
      currentAmendment?.permit_amendment_guid,
      "conditions",
    ],
  };

  const dropdownCategories = useMemo(
    () => [
      {
        groupName: "Custom Categories",
        opt: createDropDownList(
          currentAmendment?.condition_categories ?? [],
          "description",
          "condition_category_code"
        ),
      },
      {
        groupName: "Standard Categories",
        opt: createDropDownList(
          condWithoutConditionsText,
          "description",
          "condition_category_code"
        ),
      },
    ],
    [currentAmendment?.condition_categories, condWithoutConditionsText]
  );

  const bannerHeight = isCore ? 30 : 60;
  const topOffset = 99 + 45 + bannerHeight; // header + tab nav

  const handleAddCondition = async () => {
    setAddingToCategoryCode(null);
    await refreshData();
  };

  const toggleViewPdf = () => {
    setViewPdf(!viewPdf);
  };

  const openCreateCategoryModal = (event) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          title: `Add Condition Category`,
          handleSubmit: async (category) => {
            await dispatch(
              createPermitAmendmentConditionCategory(
                mineGuid,
                permitGuid,
                currentAmendment.permit_amendment_guid,
                {
                  ...category,
                  display_order: formattedPermitConditionCategories.length,
                }
              )
            );

            dispatch(closeModal());
          },
        },
        content: PermitConditionCategoryEditModal,
      })
    );
  };

  const handleUpdateConditionCategory = (category: IPermitConditionCategory) => {
    setLoading(true);
    dispatch(
      updatePermitAmendmentConditionCategory(
        mineGuid,
        permitGuid,
        currentAmendment.permit_amendment_guid,
        category
      )
    ).finally(() => setLoading(false));
  };

  const handleDeleteConditionCategory = (category: IPermitConditionCategory) => {
    setLoading(true);
    dispatch(
      deletePermitAmendmentConditionCategory(
        mineGuid,
        permitGuid,
        currentAmendment.permit_amendment_guid,
        category.condition_category_code
      )
    ).finally(() => setLoading(false));
  };

  const handleMove = (category: IPermitConditionCategory, newOrder: number) => {
    const updatedCat = {
      ...category,
      display_order: newOrder,
    };

    dispatch(
      updatePermitAmendmentConditionCategory(
        mineGuid,
        permitGuid,
        currentAmendment.permit_amendment_guid,
        updatedCat
      )
    );
  };

  const handleMoveCondition = async (condition: IPermitCondition, isMoveUp: boolean) => {
    const newOrder = isMoveUp ? condition.display_order - 1 : condition.display_order + 1;
    const updatedCond = {
      ...condition,
      display_order: newOrder,
    };

    await dispatch(
      updatePermitCondition(
        condition.permit_condition_guid,
        currentAmendment.permit_amendment_guid,
        updatedCond
      )
    );
    await refreshData();
  };
  const viewPermitAmendment = (e) => {
    e.preventDefault();
    history.push(
      GLOBAL_ROUTES.VIEW_MINE_PERMIT_AMENDMENT.dynamicRoute(
        mineGuid,
        permitGuid,
        latestAmendment?.permit_amendment_guid,
        "conditions"
      )
    );
  };

  const AddConditionModalContent = (
    <Typography.Paragraph
      className="no_link_styling grey"
      style={{ fontSize: "14px", textAlign: "center", margin: "20px" }}
    >
      <CoreButton
        type="link"
        loading={showLoading}
        onClick={openCreateCategoryModal}
        className="fade-in category-add-btn"
      >
        + Add Condition Category
      </CoreButton>
    </Typography.Paragraph>
  );

  const canViewPdfSplitScreen =
    viewPdf &&
    pdfSplitViewEnabled &&
    (permitExtraction?.permit_amendment_document_guid || permitAmendmentDocumentGuid);

  const hasConditions = currentAmendment?.conditions?.length > 0;

  useEffect(() => {
    if (selectedConditionId && !showLoading && currentAmendment?.conditions?.length > 0) {
      scrollToCondition(selectedConditionId);
    }
  }, [selectedConditionId, showLoading, currentAmendment?.conditions]);

  const isViewingLatestAmendment =
    latestAmendment?.permit_amendment_guid === currentAmendment?.permit_amendment_guid;

  if (!forceViewConditions) {
    const extractionState = renderExtractionState(
      isViewingLatestAmendment,
      isExtractionInProgress,
      isExtractionComplete,
      canStartExtraction,
      permitExtraction
    );
    if (extractionState) {
      return extractionState;
    }
  }

  const renderContent = () => (
    <Row align="middle" justify="space-between" gutter={[10, 16]}>
      <LatestAmendmentWarning
        latestAmendment={latestAmendment}
        currentAmendment={currentAmendment}
        onViewAmendment={viewPermitAmendment}
      />
      <Col span={24}>
        <Title className="margin-none" level={2}>
          Permit Conditions
        </Title>
      </Col>

      <Col>
        <Row gutter={10}>
          <Col>
            <CoreButton
              loading={showLoading}
              type="tertiary"
              className="fa-icon-container"
              icon={<FontAwesomeIcon icon={isExpanded ? faArrowsToLine : faArrowsFromLine} />}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"} All Conditions
            </CoreButton>
          </Col>
          <Col>
            <CoreButton
              type="tertiary"
              icon={<FileOutlined />}
              loading={showLoading}
              onClick={toggleViewPdf}
            >
              {viewPdf ? "Close" : "Open Permit in"} Document Viewer
            </CoreButton>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <div className="common-page-content">
          <Row gutter={[16, 16]}>
            {formattedPermitConditionCategories.map((category, idx) => {
              return (
                <React.Fragment key={category.href}>
                  <Col span={24}>
                    <Row justify="space-between">
                      <Title level={3} className="margin-none" id={category.href}>
                        <EditPermitConditionCategoryInline
                          canEdit={
                            isExtracted && canEditPermitConditions(category.condition_category)
                          }
                          onDelete={handleDeleteConditionCategory}
                          onChange={handleUpdateConditionCategory}
                          moveUp={(cat) => handleMove(cat, idx - 1)}
                          moveDown={(cat) => handleMove(cat, idx + 1)}
                          currentPosition={idx}
                          categoryCount={formattedPermitConditionCategories.length}
                          category={category.condition_category}
                          conditionCount={category?.conditions.length || 0}
                        />
                      </Title>
                      {canEditPermitConditions(category.condition_category) && isExtracted && (
                        <CoreButton
                          type="primary"
                          loading={showLoading}
                          disabled={Boolean(addingToCategoryCode) || Boolean(editingConditionGuid)}
                          onClick={() => setAddingToCategoryCode(category.condition_category_code)}
                        >
                          Add Condition
                        </CoreButton>
                      )}
                    </Row>
                    {isFeatureEnabled(Feature.MODIFY_PERMIT_CONDITIONS) && userCanEdit && (
                      <PermitConditionReviewAssignment category={category?.condition_category} />
                    )}
                  </Col>
                  {category.conditions.map((sc, idx) => (
                    <Col span={24} key={sc.permit_condition_id} className="fade-in">
                      <PermitConditionLayer
                        previousAmendment={previousAmendment}
                        isExtracted={isExtracted}
                        permitAmendmentGuid={currentAmendment?.permit_amendment_guid}
                        condition={sc}
                        isExpanded={isExpanded}
                        handleMoveCondition={handleMoveCondition}
                        currentPosition={idx}
                        conditionCount={category.conditions.length}
                        canEditPermitConditions={canEditPermitConditions(
                          category.condition_category
                        )}
                        setEditingConditionGuid={setEditingConditionGuid}
                        editingConditionGuid={editingConditionGuid ?? addingToCategoryCode}
                        refreshData={refreshData}
                        conditionSelected={setSelectedCondition}
                        categoryOptions={dropdownCategories}
                        mineGuid={mineGuid}
                        permitGuid={permitGuid}
                      />
                    </Col>
                  ))}
                  {addingToCategoryCode === category.condition_category_code && (
                    <Col span={24}>
                      <SubConditionForm
                        conditionCategory={category}
                        permitAmendmentGuid={currentAmendment.permit_amendment_guid}
                        handleCancel={() => setAddingToCategoryCode(null)}
                        onSubmit={handleAddCondition}
                        categoryOptions={dropdownCategories}
                      />
                    </Col>
                  )}
                </React.Fragment>
              );
            })}
          </Row>
        </div>
      </Col>
    </Row>
  );

  return (
    <>
      {hasConditions && (
        <PermitReviewBanner
          isExtracted={isExtracted}
          height={bannerHeight}
          isReviewComplete={isReviewComplete}
        />
      )}
      <PermitConditionsProvider
        value={{
          mineGuid,
          permitGuid,
          latestAmendment,
          previousAmendment,
          currentAmendment,
          loading: showLoading,
          setLoading,
        }}
      >
        <Row>
          <Col span={canViewPdfSplitScreen ? 16 : 24}>
            <ScrollSidePageWrapper
              header={null}
              headerHeight={topOffset}
              menuProps={scrollSideMenuProps}
              extraItems={userCanEdit && isExtracted ? AddConditionModalContent : null}
              view={isReviewComplete ? "anchor" : "steps"}
              content={renderContent()}
            />
          </Col>
          {canViewPdfSplitScreen && (
            <Col style={{ padding: "16px", height: "inherit" }} span={8}>
              <div style={{ position: "sticky", top: "225px" }}>
                <PreviewPermitAmendmentDocument
                  amendment={currentAmendment}
                  documentGuid={
                    permitExtraction?.permit_amendment_document_guid || permitAmendmentDocumentGuid
                  }
                  selectedCondition={selectedCondition}
                />
              </div>
            </Col>
          )}
        </Row>
      </PermitConditionsProvider>
    </>
  );
};

export default React.memo(PermitConditions);
