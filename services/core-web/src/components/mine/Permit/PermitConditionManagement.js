import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Collapse, Button, Row, Col } from "antd";
import { flattenObject, formatDate } from "@common/utils/helpers";
import { ReadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
} from "@common/selectors/staticContentSelectors";
import { getPermitConditions, getEditingConditionFlag } from "@common/selectors/permitSelectors";
import {
  fetchPermitConditions,
  deletePermitCondition,
  updatePermitCondition,
  setEditingConditionFlag,
  getPermitAmendment,
} from "@common/actionCreators/permitActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { maxBy } from "lodash";
import AddCondition from "@/components/Forms/permits/conditions/AddCondition";
import ConditionLayerOne from "@/components/Forms/permits/conditions/ConditionLayerOne";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import { COLOR } from "@/constants/styles";
import { Link } from "react-router-dom";
import * as route from "@/constants/routes";

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  conditions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  permitConditionCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  editingConditionFlag: PropTypes.bool.isRequired,
  fetchPermitConditions: PropTypes.func.isRequired,
  setEditingConditionFlag: PropTypes.func.isRequired,
  deletePermitCondition: PropTypes.func.isRequired,
  updatePermitCondition: PropTypes.func.isRequired,
  getPermitAmendment: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  match: CustomPropTypes.PermitConditionManagement.match.isRequired,
};

export class PermitConditionManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      permitNo: "",
      issuesDate: "",
      authEndDate: "",
      mineName: "",
      mineGuid: this.props.match.params.mine_guid,
      permitAmendmentGuid: this.props.match.params.id,
    };
    this.fetchPermitConditions();
    props.setEditingConditionFlag(false);
  }

  componentDidMount = () => {
    this.props.fetchMineRecordById(this.state.mineGuid).then((response) => {
      this.setState({
        mineName: response.data.mine_name,
      });
    });
    this.props
      .getPermitAmendment(this.state.mineGuid, this.state.permitAmendmentGuid)
      .then((response) => {
        this.setState({
          permitNo: response.data.permit_no,
          issuesDate: response.data.issue_date,
          authEndDate: response.data.authorization_end_date,
        });
      });
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.fetchPermitConditions();
    }
  };

  fetchPermitConditions = () => {
    this.props.fetchPermitConditions(this.state.permitAmendmentGuid);
  };

  handleDelete = (condition) => {
    this.setState({ submitting: true });
    this.props
      .deletePermitCondition(this.state.permitAmendmentGuid, condition.permit_condition_guid)
      .then(() => {
        this.setState({ submitting: false });
        this.props.closeModal();
        this.fetchPermitConditions();
      });
  };

  openDeleteConditionModal = (condition) => {
    this.props.openModal({
      props: {
        title: "Delete condition",
        handleDelete: this.handleDelete,
        closeModal: this.props.closeModal,
        submitting: this.state.submitting,
        condition,
      },
      width: "50vw",
      content: modalConfig.DELETE_CONDITION_MODAL,
    });
  };

  openViewConditionModal = (event, conditions, conditionCategory) => {
    event.preventDefault();
    return this.props.openModal({
      props: {
        title: conditionCategory,
        closeModal: this.props.closeModal,
        conditions,
      },
      width: "50vw",
      isViewOnly: true,
      content: modalConfig.VIEW_CONDITION_MODAL,
    });
  };

  handleEdit = (values) => {
    return this.props
      .updatePermitCondition(values.permit_condition_guid, this.state.permitAmendmentGuid, values)
      .then(() => {
        this.props.fetchPermitConditions(this.state.permitAmendmentGuid);
        this.props.setEditingConditionFlag(false);
      });
  };

  reorderConditions = (condition, isMoveUp) => {
    condition.display_order = isMoveUp ? condition.display_order - 1 : condition.display_order + 1;
    return this.props
      .updatePermitCondition(
        condition.permit_condition_guid,
        this.state.permitAmendmentGuid,
        condition
      )
      .then(() => {
        this.props.fetchPermitConditions(this.state.permitAmendmentGuid);
      });
  };

  setConditionEditingFlag = (value) => {
    this.props.setEditingConditionFlag(value);
  };

  render = () => {
    return (
      <>
        <div>
          <div className="landing-page__header">
            <Row>
              <Col sm={22} md={14} lg={12}>
                <h1>Add/Edit Permit Conditions for {this.state.permitNo}</h1>
              </Col>
            </Row>
            <Row>
              <Col sm={22} md={14} lg={12}>
                <h1>
                  ({formatDate(this.state.issuesDate)} - {formatDate(this.state.authEndDate)})
                </h1>
              </Col>
            </Row>
            <Row>
              <Col sm={22} md={14} lg={12}>
                <Link to={route.MINE_PERMITS.dynamicRoute(this.state.mineGuid)}>
                  <ArrowLeftOutlined className="padding-sm--right" />
                  Back to: {this.state.mineName} Permits
                </Link>
              </Col>
            </Row>
          </div>
          <div className="tab__content">
            <Collapse>
              {this.props.permitConditionCategoryOptions.map((conditionCategory) => {
                const conditions = this.props.conditions.filter(
                  (condition) =>
                    condition.condition_category_code === conditionCategory.condition_category_code
                );
                return (
                  <Collapse.Panel
                    style={{ padding: "18px 16px", backgroundColor: COLOR.lightGrey }}
                    header={
                      <span>
                        {`${conditionCategory.step} ${conditionCategory.description} (${
                          Object.values(flattenObject({ conditions })).filter(
                            (value) => value === "CON"
                          ).length
                        } conditions)`}
                        <span role="button" onClick={(event) => event.stopPropagation()}>
                          <Button
                            ghost
                            onClick={(event) =>
                              this.openViewConditionModal(
                                event,
                                this.props.conditions.filter(
                                  (condition) =>
                                    condition.condition_category_code ===
                                    conditionCategory.condition_category_code
                                ),
                                conditionCategory.description
                              )
                            }
                          >
                            <ReadOutlined className="padding-sm--right icon-sm violet" />
                          </Button>
                        </span>
                      </span>
                    }
                    key={conditionCategory.condition_category_code}
                    id={conditionCategory.condition_category_code}
                  >
                    {conditions.map((condition) => (
                      <ConditionLayerOne
                        condition={condition}
                        reorderConditions={this.reorderConditions}
                        handleSubmit={this.handleEdit}
                        handleDelete={this.openDeleteConditionModal}
                        setConditionEditingFlag={this.setConditionEditingFlag}
                        editingConditionFlag={this.props.editingConditionFlag}
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
                        permit_amendment_id: this.state.permitAmendmentGuid,
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
}

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

PermitConditionManagement.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(PermitConditionManagement);
