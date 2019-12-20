import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { AutoComplete, Button, Col, Row } from "antd";
import { uniqBy } from "lodash";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchMineNameList, fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import MineCard from "@/components/mine/NoticeOfWork/MineCard";
import CustomPropTypes from "@/customPropTypes";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

const propTypes = {
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  handleProgressChange: PropTypes.func.isRequired,
  fetchMineNameList: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  setMineGuid: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  currentMine: CustomPropTypes.mine.isRequired,
  isImported: PropTypes.bool.isRequired,
};

export class VerifyNOWMine extends Component {
  state = {
    isLoaded: false,
    isMineLoaded: false,
    mine: { mine_location: { latitude: "", longitude: "" } },
  };

  componentDidMount() {
    this.props.fetchMineNameList().then(() => {
      this.setState({ isLoaded: true });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentMine && nextProps.currentMine !== this.state.mine) {
      this.setState({ isMineLoaded: true, mine: nextProps.currentMine });
    }
  }

  handleChange = (name) => {
    if (name.length > 2) {
      this.props.fetchMineNameList({ name });
    } else if (name.length === 0) {
      this.props.fetchMineNameList();
    }
  };

  handleMineSearch = (value) => {
    this.props.setMineGuid(value);
    this.setState({ isMineLoaded: false });
    this.props.fetchMineRecordById(value).then((data) => {
      this.setState({ isMineLoaded: true, mine: data.data });
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
      <div className="tab__content">
        <h4>Verify Mine</h4>
        <p>
          Review the information below and verify that the mine associated with the notice of work
          is correct. Use the search to associate a different mine.
        </p>
        <br />

        <LoadingWrapper condition={this.state.isLoaded}>
          <Row>
            <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
              <RenderAutoComplete
                placeholder="Search for a mine by name"
                handleSelect={this.handleMineSearch}
                defaultValue={`${this.props.noticeOfWork.mine_name} - ${this.props.noticeOfWork.mine_no}`}
                data={this.transformData(this.props.mineNameList)}
                handleChange={this.handleChange}
                disabled={this.props.isImported}
              />
            </Col>
          </Row>
        </LoadingWrapper>
        <LoadingWrapper condition={this.state.isMineLoaded}>
          {this.state.isLoaded && <MineCard mine={this.state.mine} />}
          <div className="right">
            {!this.props.isImported && (
              <Button type="primary" onClick={() => this.props.handleSave()}>
                Confirm Details
              </Button>
            )}
            {this.props.isImported && this.props.noticeOfWork.application_progress.length === 0 && (
              <Button type="primary" onClick={() => this.props.handleProgressChange("REV")}>
                Ready for Technical Review
              </Button>
            )}
          </div>
        </LoadingWrapper>
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

VerifyNOWMine.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VerifyNOWMine);
