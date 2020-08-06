import React, { Component } from 'react';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import AddButton from "@/components/common/AddButton";
import Section from "@/components/Forms/permits/conditions/Section"
import SubCondition from "@/components/Forms/permits/conditions/SubCondition"
import ListItem from "@/components/Forms/permits/conditions/ListItem"
import { getEditingConditionFlag, getDraftPermitAmendmentForNOW } from "@common/selectors/permitSelectors";
import { setEditingConditionFlag, createPermitCondition, fetchPermitConditions } from "@common/actionCreators/permitActionCreator";

const propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
    editingConditionFlag: PropTypes.bool.isRequired,
    setEditingConditionFlag: PropTypes.func.isRequired,
    createPermitCondition: PropTypes.func.isRequired,
    fetchPermitConditions: PropTypes.func.isRequired,
    draftPermitAmendment: CustomPropTypes.permit.isRequired,
};

const defaultProps = {
};

const ConditionComponent = (props) =>
    ({
        'SEC': <Section {...props} />,
        'CON': <SubCondition {...props} />,
        'LIS': <ListItem {...props} />,
    }[props.initialValues.condition_type_code]);

const ButtonText = (condition_type_code) =>
    ({
        'SEC': 'Add Sub-Section',
        'CON': 'Add Condition',
        'LIS': 'Add List-Item',
    }[condition_type_code]);

export class AddCondition extends Component {
    state = { isEditing: false }
    handleSubmit = (values) => this.props.createPermitCondition(null, null, this.props.draftPermitAmendment.permit_amendment_guid, values).then(() => {
        this.props.fetchPermitConditions(null, null, this.props.draftPermitAmendment.permit_amendment_guid);
        this.props.setEditingConditionFlag(false);
        this.setState({ isEditing: false });
    });

    handleCancel = () => {
        this.props.setEditingConditionFlag(false);
        this.setState({ isEditing: false })
    }

    render = () => {
        return (
            <>
                {this.props.editingConditionFlag && <AddButton type="secondary" disabled >{ButtonText(this.props.initialValues.condition_type_code)}</AddButton>}
                {!this.props.editingConditionFlag && <AddButton type="secondary" onClick={() => {
                    this.props.setEditingConditionFlag(true);
                    this.setState({ isEditing: true });
                }}>{ButtonText(this.props.initialValues.condition_type_code)}</AddButton>}
                {this.state.isEditing && <ConditionComponent new handleCancel={() => this.handleCancel()} handleSubmit={(values) => this.handleSubmit(values)} initialValues={this.props.initialValues} />}
            </>
        );
    };
}

const mapStateToProps = (state) => ({
    editingConditionFlag: getEditingConditionFlag(state),
    draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            setEditingConditionFlag,
            fetchPermitConditions,
            createPermitCondition
        },
        dispatch
    );

AddCondition.propTypes = propTypes;
AddCondition.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(AddCondition);