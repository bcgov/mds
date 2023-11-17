import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import MergePartyConfirmationForm from "@/components/Forms/parties/MergePartyConfirmationForm";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  title: PropTypes.string.isRequired,
  isPerson: PropTypes.bool.isRequired,
  partyRelationshipTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  roles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
};

const defaultProps = {};

export const MergePartyConfirmationModal = (props) => {
  return (
    <div>
      <MergePartyConfirmationForm
        isPerson={props.isPerson}
        initialValues={props.initialValues}
        provinceOptions={props.provinceOptions}
        closeModal={props.closeModal}
        title={props.title}
        roles={props.roles}
        partyRelationshipTypesHash={props.partyRelationshipTypesHash}
        {...props}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  provinceOptions: getDropdownProvinceOptions(state),
});

MergePartyConfirmationModal.propTypes = propTypes;
MergePartyConfirmationModal.defaultProps = defaultProps;

export default connect(mapStateToProps)(MergePartyConfirmationModal);
