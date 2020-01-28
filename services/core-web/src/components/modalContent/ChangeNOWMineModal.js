import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { AutoComplete } from "antd";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { fetchMineNameList, fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { getMineNames } from "@common/selectors/mineSelectors";
import ChangeNOWMineForm from "@/components/Forms/noticeOfWork/ChangeNOWMineForm";
import MineCard from "@/components/mine/NoticeOfWork/MineCard";
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

  componentDidMount() {
    this.updateMine(this.props.noticeOfWork.mine_guid);
  }

  handleChange = (name) => {
    if (name.length > 2) {
      this.props.fetchMineNameList({ name });
    } else if (name.length === 0) {
      this.props.fetchMineNameList();
    }
  };

  updateMine = (value) => {
    this.setState({ isMineLoaded: false });
    this.props.fetchMineRecordById(value).then((data) => {
      this.setState({ isMineLoaded: true, mine: data.data });
      this.props.setMineGuid(value, data.data.mine_name);
    });
  };

  transformData = (data) =>
    data.map(({ mine_guid, mine_name, mine_no }) => (
      <AutoComplete.Option key={mine_guid} value={mine_guid}>
        {`${mine_name} - ${mine_no}`}
      </AutoComplete.Option>
    ));

  render() {
    return (
      <div>
        <ChangeNOWMineForm
          {...this.props}
          handleChange={this.handleChange}
          handleSelect={this.updateMine}
          data={this.transformData(this.props.mineNameList)}
        />
        {this.state.isMineLoaded && <MineCard mine={this.state.mine} />}
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
