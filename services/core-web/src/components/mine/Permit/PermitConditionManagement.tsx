import React, { FC, useEffect, useState, useRef } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider, Collapse, Button, Row, Col } from "antd";
import { flattenObject, formatDate } from "@common/utils/helpers";
import { ReadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getPermitConditions, getEditingConditionFlag } from "@mds/common/redux/selectors/permitSelectors";
import {
  fetchPermitConditions,
  deletePermitCondition,
  updatePermitCondition,
  setEditingConditionFlag,
  getPermitAmendment,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { maxBy } from "lodash";
import AddCondition from "@/components/Forms/permits/conditions/AddCondition";
import ConditionLayerOne from "@/components/Forms/permits/conditions/ConditionLayerOne";
import { modalConfig } from "@/components/modalContent/config";
import { COLOR } from "@/constants/styles";
import { Link } from "react-router-dom";
import * as route from "@/constants/routes";
import { IOption, IPermitAmendment } from "@mds/common";
import { ActionCreator } from "@/interfaces/actionCreator";

interface PermitConditionManagementProps {
  openModal: (arg1: any) => void;
  closeModal: () => void;
  conditions: any[];
  permitConditionCategoryOptions: any[];
  editingConditionFlag: boolean;
  fetchPermitConditions: ActionCreator<typeof fetchPermitConditions>;
  setEditingConditionFlag: ActionCreator<typeof setEditingConditionFlag>;
  deletePermitCondition: ActionCreator<typeof deletePermitCondition>;
  updatePermitCondition: ActionCreator<typeof updatePermitCondition>;
  getPermitAmendment: ActionCreator<typeof getPermitAmendment>;
  fetchMineRecordById: (arg1: string) => Promise<any>;
  match: any;
}

export const PermitConditionManagement: FC<PermitConditionManagementProps> = (props) => {
  const [submitting, setSubmitting] = useState(false);
  const [permitNo, setPermitNo] = useState("");
  const [issuesDate, setIssuesDate] = useState("");
  const [authEndDate, setAuthEndDate] = useState("");
  const [mineName, setMineName] = useState("");
  const [mineGuid] = useState(props.match.params.mine_guid);
  const [permitAmendmentGuid] = useState(props.match.params.id);
  const initializedRef = useRef(false);

  const fetchPermitConditionsCall = () => {
    props.fetchPermitConditions(permitAmendmentGuid);
  };

  if (!initializedRef.current) {
    initializedRef.current = true;
    fetchPermitConditionsCall();
    props.setEditingConditionFlag(false);
  }

  const usePrevParamsId = (paramsId) => {
    const ref = useRef<any>();
    useEffect(() => {
      ref.current = paramsId;
    });
    return ref.current;
  };

  const prevParamsId = usePrevParamsId(props.match.params.id);

  useEffect(() => {
    props.fetchMineRecordById(mineGuid).then((response) => {
      setMineName(response.data.mine_name);
    });
    props.getPermitAmendment(mineGuid, permitAmendmentGuid).then((response: IPermitAmendment) => {
      setPermitNo(response.permit_no);
      setIssuesDate(response.issue_date);
      setAuthEndDate(response.authorization_end_date);
    });
  }, []);

  useEffect(() => {
    if (prevParamsId !== props.match.params.id) {
      fetchPermitConditionsCall();
    }
  }, [props.match.params.id]);

  const handleDelete = (condition) => {
    setSubmitting(true);
    props.deletePermitCondition(permitAmendmentGuid, condition.permit_condition_guid).then(() => {
      setSubmitting(false);
      props.closeModal();
      fetchPermitConditionsCall();
    });
  };

  const openDeleteConditionModal = (condition) => {
    props.openModal({
      props: {
        title: "Delete condition",
        handleDelete: handleDelete,
        closeModal: props.closeModal,
        submitting: submitting,
        condition,
      },
      width: "50vw",
      content: modalConfig.DELETE_CONDITION_MODAL,
    });
  };

  const openViewConditionModal = (event, conditions, conditionCategory) => {
    event.preventDefault();
    return props.openModal({
      props: {
        title: conditionCategory,
        closeModal: props.closeModal,
        conditions,
      },
      width: "50vw",
      isViewOnly: true,
      content: modalConfig.VIEW_CONDITION_MODAL,
    });
  };

  const handleEdit = (values) => {
    return props
      .updatePermitCondition(values.permit_condition_guid, permitAmendmentGuid, values)
      .then(() => {
        props.fetchPermitConditions(permitAmendmentGuid);
        props.setEditingConditionFlag(false);
      });
  };

  const reorderConditions = (condition, isMoveUp) => {
    condition.display_order = isMoveUp ? condition.display_order - 1 : condition.display_order + 1;
    return props
      .updatePermitCondition(condition.permit_condition_guid, permitAmendmentGuid, condition)
      .then(() => {
        props.fetchPermitConditions(permitAmendmentGuid);
      });
  };

  const setConditionEditingFlag = (value) => {
    props.setEditingConditionFlag(value);
  };

  return (
    <>
      <div>
        <div className="landing-page__header">
          <Row>
            <Col sm={22} md={14} lg={12}>
              <h1>Add/Edit Permit Conditions for {permitNo}</h1>
            </Col>
          </Row>
          <Row>
            <Col sm={22} md={14} lg={12}>
              <h1>
                ({formatDate(issuesDate)} - {authEndDate ? formatDate(authEndDate) : "Present"})
              </h1>
            </Col>
          </Row>
          <Row>
            <Col sm={22} md={14} lg={12}>
              <Link to={route.MINE_PERMITS.dynamicRoute(mineGuid)}>
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to: {mineName} Permits
              </Link>
            </Col>
          </Row>
        </div>
        <div className="tab__content">
          <Collapse>
            {props.permitConditionCategoryOptions.map((conditionCategory) => {
              const conditions = props.conditions.filter(
                (condition) =>
                  condition.condition_category_code === conditionCategory.condition_category_code
              );
              return (
                <Collapse.Panel
                  key={conditionCategory.condition_category_code}
                  id={conditionCategory.condition_category_code}
                  style={{ padding: "18px 16px", backgroundColor: COLOR.lightGrey }}
                  header={
                    <span>
                      {`${conditionCategory.step} ${conditionCategory.description} (${
                        Object.values(flattenObject({ conditions })).filter(
                          (value) => value === "CON"
                        ).length
                      } conditions)`}
                      <span role="button" onClick={(event) => event.stopPropagation()}>
                        {/* @ts-ignore */}
                        <Button
                          ghost
                          onClick={(event) =>
                            openViewConditionModal(
                              event,
                              props.conditions.filter(
                                (condition) =>
                                  condition.condition_category_code ===
                                  conditionCategory.condition_category_code
                              ),
                              conditionCategory.description
                            )
                          }
                        >
                          <ReadOutlined
                            key={conditionCategory.condition_category_code}
                            className="padding-sm--right icon-sm violet"
                          />
                        </Button>
                      </span>
                    </span>
                  }
                >
                  {conditions.map((condition) => (
                    <ConditionLayerOne
                      key={condition.permit_condition_guid}
                      condition={condition}
                      reorderConditions={reorderConditions}
                      handleSubmit={handleEdit}
                      handleDelete={openDeleteConditionModal}
                      setConditionEditingFlag={setConditionEditingFlag}
                      editingConditionFlag={props.editingConditionFlag}
                    />
                  ))}
                  <Divider />
                  <AddCondition
                    initialValues={{
                      condition_category_code: conditionCategory.condition_category_code,
                      condition_type_code: "SEC",
                      display_order:
                        conditions.length === 0
                          ? 1
                          : maxBy(conditions, "display_order").display_order + 1,
                      parent_permit_condition_id: null,
                      permit_amendment_id: permitAmendmentGuid,
                      parent_condition_type_code: "SEC",
                      sibling_condition_type_code:
                        conditions.length === 0 ? null : conditions[0].condition_type_code,
                    }}
                    layer={0}
                  />
                </Collapse.Panel>
              );
            })}
          </Collapse>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  permitConditionCategoryOptions: getPermitConditionCategoryOptions(state),
  permitConditionTypeOptions: getPermitConditionTypeOptions(state),
  conditions: getPermitConditions(state),
  editingConditionFlag: getEditingConditionFlag(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      fetchPermitConditions,
      setEditingConditionFlag,
      deletePermitCondition,
      updatePermitCondition,
      getPermitAmendment,
      fetchMineRecordById,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PermitConditionManagement);
