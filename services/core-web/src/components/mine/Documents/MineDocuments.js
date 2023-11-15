import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Divider } from "antd";
import { getMines, getMineGuid } from "@mds/common/redux/selectors/mineSelectors";
import AmazonS3Provider from "@/components/syncfusion/AmazonS3Provider";

/**
 * @class  MineDocuments.js - View the mine's archived MMS files.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export const MineDocuments = (props) => {
  const mine = props.mines[props.mineGuid];
  return (
    <div className="tab__content">
      <div>
        <h2>Archived MMS Files</h2>
        <p>Archived MMS files are available on this page. These documents are read-only.</p>
        <Divider />
        <AmazonS3Provider mineNumber={mine.mine_no} />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
});

MineDocuments.propTypes = propTypes;

export default connect(mapStateToProps)(MineDocuments);
