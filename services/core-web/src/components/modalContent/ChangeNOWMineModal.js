import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { AutoComplete } from "antd";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ChangeNOWMineForm from "@/components/Forms/noticeOfWork/ChangeNOWMineForm";
import { fetchMineNameList, fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  fetchMineNameList: PropTypes.func.isRequired,
  setMineGuid: PropTypes.func.isRequired,
  title: PropTypes.string,
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
};

const defaultProps = {
  title: "",
};

export class ChangeNOWMineModal extends Component {
  state = {
    isMineLoaded: false,
    mine: { mine_location: { latitude: "", longitude: "" } },
  };

  componentDidMount() {}

  render() {
    return (
      <div>
        <ChangeNOWMineForm {...this.props} />
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  mineNameList: getMineNames(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNameList,
      fetchMineRecordById,
    },
    dispatch
  );

ChangeNOWMineModal.propTypes = propTypes;
ChangeNOWMineModal.defaultProps = defaultProps;
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeNOWMineModal);
