import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import ChangeNOWLocationForm from "@/components/Forms/noticeOfWork/ChangeNOWLocationForm";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  fetchMineRecordById: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

const defaultProps = {
  title: "",
};

export class ChangeNOWLocationModal extends Component {
  state = { mine: {}, isLoaded: false };

  componentDidMount() {
    this.props.fetchMineRecordById(this.props.mineGuid).then(({ data }) => {
      this.setState({ mine: data, isLoaded: true });
    });
  }

  render() {
    return (
      <div>
        <LoadingWrapper condition={this.state.isLoaded}>
          <ChangeNOWLocationForm {...this.props} locationOnly mine={this.state.mine} />
        </LoadingWrapper>
      </div>
    );
  }
}

ChangeNOWLocationModal.propTypes = propTypes;
ChangeNOWLocationModal.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(ChangeNOWLocationModal);
