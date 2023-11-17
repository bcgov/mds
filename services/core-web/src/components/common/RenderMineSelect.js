import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchMineNameList } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getMineWithoutStore } from "@common/utils/actionlessNetworkCalls";
import { getMineNames } from "@mds/common/redux/selectors/mineSelectors";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import MineCard from "@/components/mine/NoticeOfWork/MineCard";
import CustomPropTypes from "@/customPropTypes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
/**
 * @constant RenderMineSelect - Ant Design `AutoComplete` component for redux-form that handles all the state for selecting a mine and updating a content card with that mines tombstone data.
 *
 */

const propTypes = {
  // redux-form value id
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  input: PropTypes.objectOf(PropTypes.any),
  meta: PropTypes.objectOf(PropTypes.any),
  label: PropTypes.String,
  fetchMineNameList: PropTypes.func.isRequired,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName).isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  majorMineOnly: PropTypes.bool,
  onMineSelect: PropTypes.func,
  fullWidth: PropTypes.bool,
  additionalPin: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  placeholder: "Search for a mine by name",
  disabled: false,
  majorMineOnly: undefined,
  onMineSelect: () => {},
  meta: {},
  label: "Select a mine",
  input: { value: "" },
  fullWidth: false,
  additionalPin: [],
};

export class RenderMineSelect extends Component {
  state = {
    selectedMine: false,
  };

  componentDidMount() {
    if (this.props.input.value) {
      getMineWithoutStore(this.props.input.value).then((data) => {
        this.setState({ selectedMine: data.data });
        this.handleChange(data.data.mine_name);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const inputChanged = this.props.input.value !== nextProps.input.value;
    if (inputChanged && !this.props.input.value) {
      getMineWithoutStore(nextProps.input.value).then((data) => {
        this.setState({ selectedMine: data.data });
        this.handleChange(data.data.mine_name);
      });
    }
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
    data.map(({ mine_guid, mine_name, mine_no }) => ({
      label: `${mine_name} - ${mine_no}`,
      value: mine_guid,
    }));

  render() {
    const isLoaded = this.state.selectedMine || false;
    const width = this.props.fullWidth ? "93vw" : "100%";
    return (
      <div>
        <RenderAutoComplete
          {...this.props}
          placeholder="Search for a mine by name"
          handleSelect={this.handleSelect}
          {...this.props.input}
          data={this.transformData(this.props.mineNameList)}
          handleChange={this.handleChange}
        />
        <div style={{ position: "relative", height: "inherit", width }}>
          <LoadingWrapper condition={isLoaded}>
            <MineCard mine={this.state.selectedMine} additionalPin={this.props.additionalPin} />
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

export default connect(mapStateToProps, mapDispatchToProps)(RenderMineSelect);
