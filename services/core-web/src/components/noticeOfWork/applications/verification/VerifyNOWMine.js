/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { AutoComplete, Button, Col, Row } from "antd";
import { uniqBy } from "lodash";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchMineNameList, fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import { fetchRegionOptions } from "@/actionCreators/staticContentActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import MineHeaderMapLeaflet from "@/components/maps/MineHeaderMapLeaflet";
import CustomPropTypes from "@/customPropTypes";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { getMineRegionHash } from "@/selectors/staticContentSelectors";

import * as Strings from "@/constants/strings";

const propTypes = {
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  handleProgressChange: PropTypes.func.isRequired,
  fetchMineNameList: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  setMineGuid: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  currentMine: CustomPropTypes.mine.isRequired,
};

export class VerifyNOWMine extends Component {
  state = {
    isLoaded: false,
    isMineLoaded: false,
    mine: { location: { latitude: "", longitude: "" } },
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
              />
            </Col>
          </Row>
        </LoadingWrapper>
        <LoadingWrapper condition={this.state.isMineLoaded}>
          <div>
            <div className="mine-content__card">
              <div className="mine-content__card-right">
                <div className="inline-flex padding-small">
                  <p className="field-title">Mine Name</p>
                  <p>{this.state.mine.mine_name}</p>
                </div>
                <div className="inline-flex padding-small">
                  <p className="field-title">Mine Number</p>
                  <p>{this.state.mine.mine_no}</p>
                </div>
                <div className="inline-flex padding-small">
                  <p className="field-title">Mine Class </p>
                  <p>
                    {this.state.mine.major_mine_ind ? Strings.MAJOR_MINE : Strings.REGIONAL_MINE}
                  </p>
                </div>
                <div className="inline-flex padding-small">
                  <p className="field-title">Permit Number</p>
                  <ul className="mine-list__permits">
                    {this.state.mine.mine_permit && this.state.mine.mine_permit.length > 0
                      ? uniqBy(this.state.mine.mine_permit, "permit_no").map(
                          ({ permit_no, permit_guid }) => <li key={permit_guid}>{permit_no}</li>
                        )
                      : Strings.EMPTY_FIELD}
                  </ul>
                </div>
              </div>
              <div className="mine-content__card-left">
                <MineHeaderMapLeaflet mine={this.state.mine} />
                <div className="mine-content__card-left--footer">
                  <div className="inline-flex between">
                    <p className="p-white">
                      Lat:{" "}
                      {this.state.mine.mine_location && this.state.mine.mine_location.latitude
                        ? this.state.mine.mine_location.latitude
                        : Strings.EMPTY_FIELD}
                    </p>
                    <p className="p-white">
                      Long:{" "}
                      {this.state.mine.mine_location && this.state.mine.mine_location.longitude
                        ? this.state.mine.mine_location.longitude
                        : Strings.EMPTY_FIELD}
                    </p>
                  </div>
                  <div className="inline-flex between">
                    <p className="p-white">
                      Region:{" "}
                      {this.state.mine.mine_region
                        ? this.props.mineRegionHash[this.state.mine.mine_region]
                        : Strings.EMPTY_FIELD}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="right">
              <Button type="primary" onClick={() => this.props.handleSave()}>
                Save
              </Button>
              {this.props.isImported && (
                <Button type="primary" onClick={() => this.props.handleProgressChange(1)}>
                  Proceed to Technical Review
                </Button>
              )}
            </div>
          </div>
        </LoadingWrapper>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineNameList: getMineNames(state),
  mineRegionHash: getMineRegionHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNameList,
      fetchMineRecordById,
      fetchRegionOptions,
    },
    dispatch
  );

VerifyNOWMine.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VerifyNOWMine);
