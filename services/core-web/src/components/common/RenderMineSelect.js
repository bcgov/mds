import React, { useState } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { Icon, Input, AutoComplete } from "antd";
import { connect } from "react-redux";
import * as Styles from "@/constants/styles";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import MineCard from "@/components/mine/NoticeOfWork/MineCard";
import CustomPropTypes from "@/customPropTypes";

import { getMineWithoutStore } from "@/utils/actionlessNetworkCalls";
import { getMineNames } from "@/selectors/mineSelectors";
/**
 * @constant RenderMineSelect - Ant Design `AutoComplete` component for redux-form.
 *
 */

const propTypes = {
  // redux-form value id
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  fetchMineNameList: PropTypes.func.isRequired,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName).isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

const defaultProps = {
  placeholder: "Search for a mine by name",
  defaultValue: "",
  iconColor: Styles.COLOR.violet,
  disabled: false,
};

const handleChange = (name, fetchMineNameList) => {
  console.log(`handle change${name}`);
  if (name.length > 2) {
    fetchMineNameList({ name });
  } else if (name.length === 0) {
    fetchMineNameList();
  }
};

const handleSelect = (value, setMine) => {
  console.log(`handle select${value}`);
  getMineWithoutStore(value).then((data) => {
    setMine(data.data);
  });
};

const transformData = (data) =>
  data.map(({ mine_guid, mine_name, mine_no }) => (
    <AutoComplete.Option key={mine_guid} value={mine_guid}>
      {`${mine_name} - ${mine_no}`}
    </AutoComplete.Option>
  ));

export const RenderMineSelect = (props) => {
  const [mine, setMine] = useState(undefined);
  console.log("RENDER");
  return (
    <div>
      <RenderAutoComplete
        {...props}
        placeholder="Search for a mine by name"
        handleSelect={(value) => handleSelect(value, setMine)}
        data={transformData(props.mineNameList)}
        handleChange={(name) => handleChange(name, props.fetchMineNameList)}
      />
      {mine && <MineCard mine={mine} />}
    </div>
  );
};

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
