import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Icon, Row, Collapse, Button } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import CustomPropTypes from "@/customPropTypes";
import Condition from "@/components/Forms/permits/conditions/Condition";
import AddCondition from "@/components/Forms/permits/conditions/AddCondition";
import { getPermitConditionCategoryOptions, getPermitConditionTypeOptions } from "@common/selectors/staticContentSelectors";
import { getPermitConditions, getDraftPermitAmendmentForNOW } from "@common/selectors/permitSelectors";
import { fetchPermitConditions, deletePermitCondition, setEditingConditionFlag } from "@common/actionCreators/permitActionCreator";
import {
    getNoticeOfWork
} from "@common/selectors/noticeOfWorkSelectors";
import { maxBy } from "lodash";

const { Panel } = Collapse;

const propTypes = {
    isViewMode: PropTypes.bool.isRequired,
    conditions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
    permitConditionCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
    permitConditionTypeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
    fetchPermitConditions: PropTypes.func.isRequired,
    noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
    draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
    setEditingConditionFlag: PropTypes.func.isRequired,
    deletePermitCondition: PropTypes.func.isRequired,
};

export class Conditions extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
        this.fetchPermitConditions();
        props.setEditingConditionFlag(false);
    }

    componentDidUpdate = (prevProps) => {
        if (prevProps.draftPermitAmendment !== this.props.draftPermitAmendment) {
            this.fetchPermitConditions();
        }
    }

    fetchPermitConditions = () => {
        if (this.props.draftPermitAmendment) {
            this.props.fetchPermitConditions(this.props.draftPermitAmendment.permit_amendment_guid);
        }
    }

    handleDelete = (permitConditionGuid) => {
        this.props.deletePermitCondition(this.props.draftPermitAmendment.permit_amendment_guid, permitConditionGuid).then(() => this.fetchPermitConditions());
    }

    render = () => <>
        <Collapse>
            {this.props.permitConditionCategoryOptions.map((conditionCategory) => {
                const conditions = this.props.conditions.filter((condition) => condition.condition_category_code === conditionCategory.condition_category_code);
                return <Panel header={conditionCategory.description} key={conditionCategory.condition_category_code} id={conditionCategory.condition_category_code}>
                    {conditions.map((condition) => <Condition condition={condition} handleSubmit={(values) => this.handleAddCondition(values)} handleDelete={(permitConditionGuid) => this.handleDelete(permitConditionGuid)} />)}
                    <Divider />
                    <AddCondition initialValues={
                        {
                            condition_category_code: conditionCategory.condition_category_code,
                            condition_type_code: 'SEC',
                            display_order: conditions.length === 0 ? 1 : maxBy(conditions, 'display_order').display_order + 1,
                            parent_condition_id: null,
                            permit_amendment_id: this.props.draftPermitAmendment.permit_amendment_id
                        }} />
                    {false &&
                        <Button type="secondary" className="full-mobile btn--middle">
                            <Icon type="undo" theme="outlined" className="padding-small--right icon-sm" />
                        Restore Deleted Standard Conditions
                    </Button>}
                </Panel>;
            })}
        </Collapse>
    </>;
}

const mapStateToProps = (state) => ({
    permitConditionCategoryOptions: getPermitConditionCategoryOptions(state),
    permitConditionTypeOptions: getPermitConditionTypeOptions(state),
    conditions: getPermitConditions(state),
    noticeOfWork: getNoticeOfWork(state),
    draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            openModal,
            closeModal,
            fetchPermitConditions,
            setEditingConditionFlag,
            deletePermitCondition,
        },
        dispatch
    );

Conditions.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(Conditions);
