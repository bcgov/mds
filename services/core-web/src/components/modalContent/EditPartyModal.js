import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import EditFullPartyForm from "@/components/Forms/parties/EditFullPartyForm";
import { searchOrgBookEntities } from "@common/actionCreators/partiesActionCreator";
import { getSearchOrgBookEntities } from "@common/selectors/partiesSelectors";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  isPerson: PropTypes.bool.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
  orgBookEntities: PropTypes.objectOf(PropTypes.any),
};

export class EditPartyModal extends Component {
  state = {
    isSearchingOrgBook: false,
  };

  handleSearchOrgBookEntitiesSubmit = (search) => {
    console.log("handleSearchOrgBookEntitiesSubmit search:\n", search);
    this.setState({ isSearchingOrgBook: true });
    this.props.searchOrgBookEntities({ search }).then(() => {
      console.log("this.props.orgBookEntities.results:\n", this.props.orgBookEntities.results);
      this.setState({ isSearchingOrgBook: false });
    });
  };

  render() {
    return (
      <EditFullPartyForm
        onSubmit={this.props.onSubmit}
        isSearchingOrgBook={this.state.isSearchingOrgBook}
        handleSearchOrgBookEntitiesSubmit={this.handleSearchOrgBookEntitiesSubmit}
        closeModal={this.props.closeModal}
        isPerson={this.props.isPerson}
        provinceOptions={this.props.provinceOptions}
        initialValues={this.props.initialValues}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  orgBookEntities: getSearchOrgBookEntities(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      searchOrgBookEntities,
    },
    dispatch
  );

EditPartyModal.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(EditPartyModal);
