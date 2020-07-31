import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Icon, Row, Collapse, Button } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import CustomPropTypes from "@/customPropTypes";
import Condition from "@/components/Forms/permits/conditions/Condition";
import AddButton from "@/components/common/AddButton";
import { getPermitConditionCategoryOptions, getPermitConditionTypeOptions } from "@common/selectors/staticContentSelectors";
import { getPermitConditions } from "@common/selectors/permitSelectors";
import { fetchPermitConditions } from "@common/actionCreators/permitActionCreator";

const { Panel } = Collapse;

const propTypes = {
    isViewMode: PropTypes.bool.isRequired,
    conditions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
    permitConditionCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
    permitConditionTypeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
    fetchPermitConditions: PropTypes.func.isRequired,
};

const defaultProps = {
};



export class Conditions extends Component {
    state = {
    };

    componentWillMount = () => {
        this.props.fetchPermitConditions(null, null, 'd3583567-2812-4d18-8d75-466d0ab3fbf6');
    };

    render() {
        return (
            <>
                <Collapse>
                    {this.props.permitConditionCategoryOptions.map((conditionCategory) =>
                        <Panel header={conditionCategory.description} key={conditionCategory.condition_category_code} id={conditionCategory.condition_category_code}>
                            {this.props.conditions.filter((condition) => condition.condition_category === conditionCategory.condition_category_code).map((condition) => <Condition condition={condition} />)}
                        </Panel>
                    )}
                </Collapse>
                <Divider />
                <AddButton type="secondary">Add Sub-Section</AddButton>
                <Button type="secondary" className="full-mobile btn--middle">
                    <Icon type="undo" theme="outlined" className="padding-small--right icon-sm" />
                    Restore Deleted Standard Conditions
                </Button>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    permitConditionCategoryOptions: getPermitConditionCategoryOptions(state),
    permitConditionTypeOptions: getPermitConditionTypeOptions(state),
    conditions: getPermitConditions(state),
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            openModal,
            closeModal,
            fetchPermitConditions,
        },
        dispatch
    );

Conditions.propTypes = propTypes;
Conditions.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Conditions);
