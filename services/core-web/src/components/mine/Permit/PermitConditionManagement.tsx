import React, { FC, useEffect, useState, useRef } from "react";
import { Divider, Collapse, Button, Row, Col } from "antd";
import { flattenObject, formatDate } from "@common/utils/helpers";
import { ReadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getPermitConditionCategoryOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  getPermitConditions,
  getEditingConditionFlag,
} from "@mds/common/redux/selectors/permitSelectors";
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
import { Link, useParams } from "react-router-dom";
import * as route from "@/constants/routes";
import { IPermitAmendment } from "@mds/common/interfaces";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";


export const PermitConditionManagement: FC = () => {
  const dispatch = useAppDispatch();
  const params = useParams<{ mine_guid: string, id: string }>();

  const permitConditionCategoryOptions = useAppSelector(getPermitConditionCategoryOptions);
  const permitConditions = useAppSelector(getPermitConditions);
  const editingConditionFlag = useAppSelector(getEditingConditionFlag);

  const [submitting, setSubmitting] = useState(false);
  const [permitNo, setPermitNo] = useState("");
  const [issuesDate, setIssuesDate] = useState("");
  const [authEndDate, setAuthEndDate] = useState("");
  const [mineName, setMineName] = useState("");
  const mineGuid = params.mine_guid;
  const permitAmendmentGuid = params.id;
  const initializedRef = useRef(false);

  const fetchPermitConditionsCall = () => {
    dispatch(fetchPermitConditions(permitAmendmentGuid));
  };

  if (!initializedRef.current) {
    initializedRef.current = true;
    fetchPermitConditionsCall();
    dispatch(setEditingConditionFlag(false));
  }

  const usePrevParamsId = (paramsId) => {
    const ref = useRef<any>();
    useEffect(() => {
      ref.current = paramsId;
    });
    return ref.current;
  };

  const prevParamsId = usePrevParamsId(params.id);

  useEffect(() => {
    dispatch(fetchMineRecordById(mineGuid)).then((response) => {
      setMineName(response.data.mine_name);
    });
    dispatch(getPermitAmendment(mineGuid, permitAmendmentGuid)).then((response: IPermitAmendment) => {
      setPermitNo(response.permit_no);
      setIssuesDate(response.issue_date);
      setAuthEndDate(response.authorization_end_date);
    });
  }, []);

  useEffect(() => {
    if (prevParamsId !== params.id) {
      fetchPermitConditionsCall();
    }
  }, [params.id]);

  const handleDelete = (condition) => {
    setSubmitting(true);
    dispatch(deletePermitCondition(permitAmendmentGuid, condition.permit_condition_guid)).then(() => {
      setSubmitting(false);
      dispatch(closeModal());
      fetchPermitConditionsCall();
    });
  };

  const openDeleteConditionModal = (condition) => {
    dispatch(openModal({
      props: {
        title: "Delete condition",
        handleDelete: handleDelete,
        submitting: submitting,
        condition,
      },
      width: "50vw",
      content: modalConfig.DELETE_CONDITION_MODAL,
    }));
  };

  const openViewConditionModal = (event, conditions, conditionCategory) => {
    event.preventDefault();
    return dispatch(openModal({
      props: {
        title: conditionCategory,
        conditions,
      },
      width: "50vw",
      isViewOnly: true,
      content: modalConfig.VIEW_CONDITION_MODAL,
    }));
  };

  const handleEdit = (values) => {
    return dispatch(
      updatePermitCondition(values.permit_condition_guid, permitAmendmentGuid, values))
      .then(() => {
        dispatch(fetchPermitConditions(permitAmendmentGuid));
        dispatch(setEditingConditionFlag(false));
      });
  };

  const reorderConditions = (condition, isMoveUp) => {
    condition.display_order = isMoveUp ? condition.display_order - 1 : condition.display_order + 1;
    return dispatch(
      updatePermitCondition(condition.permit_condition_guid, permitAmendmentGuid, condition))
      .then(() => {
        dispatch(fetchPermitConditions(permitAmendmentGuid));
      });
  };

  const setConditionEditingFlag = (value) => {
    dispatch(setEditingConditionFlag(value));
  };

  return (
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
          {permitConditionCategoryOptions.map((conditionCategory) => {
            const conditions = permitConditions.filter(
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
                    {`${conditionCategory.step} ${conditionCategory.description} (${Object.values(flattenObject({ conditions })).filter(
                      (value) => value === "CON"
                    ).length
                      } conditions)`}
                    <span role="button" onClick={(event) => event.stopPropagation()}>
                      <Button
                        ghost
                        onClick={(event) =>
                          openViewConditionModal(
                            event,
                            permitConditions.filter(
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
                    editingConditionFlag={editingConditionFlag}
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
  );
};

export default PermitConditionManagement;
