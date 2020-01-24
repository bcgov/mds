import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { AutoComplete } from "antd";
import { connect } from "react-redux";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import MineCard from "@/components/mine/NoticeOfWork/MineCard";
import CustomPropTypes from "@/customPropTypes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

import { getMineWithoutStore } from "@/utils/actionlessNetworkCalls";
import { getMineNames } from "@/selectors/mineSelectors";
/**
 * @constant RenderMineSelect - Ant Design `AutoComplete` component for redux-form that handles all the state for selecting a mine and updating a content card with that mines tombstone data.
 *
 */

const propTypes = {
  // redux-form value id
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  meta: PropTypes.objectOf(PropTypes.any),
  label: PropTypes.String,
  fetchMineNameList: PropTypes.func.isRequired,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName).isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  showCard: PropTypes.bool,
  majorMineOnly: PropTypes.bool,
  onMineSelect: PropTypes.func,
};

const defaultProps = {
  placeholder: "Search for a mine by name",
  disabled: false,
  showCard: false,
  majorMineOnly: undefined,
  onMineSelect: () => {},
  meta: {},
  label: "Select a mine",
};

export class RenderMineSelect extends Component {
  state = {
    selectedMine: false,
  };

  componentDidMount() {
    getMineWithoutStore(this.props.input.value).then((data) => {
      this.setState({ selectedMine: data.data });
      this.handleChange(data.data.mine_name);
    });
  }

  handleChange = (name) => {
    let params = { name };
    if (this.props.majorMineOnly) {
      params = { major: true, ...params };
    }

    if (name.length > 2) {
      this.props.fetchMineNameList(params);
    } else if (name.length === 0) {
      this.props.fetchMineNameList({ major: true });
    }
  };

  handleSelect = (value) => {
    this.setState({ selectedMine: false });
    getMineWithoutStore(value).then((data) => {
      this.setState({ selectedMine: data.data });
      this.props.onMineSelect(value);
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
        <RenderAutoComplete
          {...this.props}
          placeholder="Search for a mine by name"
          handleSelect={this.handleSelect}
          data={this.transformData(this.props.mineNameList)}
          handleChange={this.handleChange}
        />
        <div style={{ position: "relative", height: "inherit" }}>
          <LoadingWrapper condition={this.state.selectedMine}>
            <MineCard mine={this.state.selectedMine} />
          </LoadingWrapper>
        </div>
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
    },
    dispatch
  );

RenderMineSelect.propTypes = propTypes;
RenderMineSelect.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RenderMineSelect);
