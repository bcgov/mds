/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import { DownOutlined } from "@ant-design/icons";

/**
 * @class  MineDocuments - All documents pulled from MMS backdoor file system.
 */

const propTypes = {};

export class MineDocuments extends Component {
  state = {
    expandedKeys: [],
    searchValue: "",
    autoExpandParent: true,
  };

  onSelect = (keys, event) => {
    console.log("Trigger Select", keys, event);
  };

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  render() {
    return (
      <div className="tab__content">
        <div>
          <h2>Archived Files</h2>
          <p>MMS archived files are available on this page. These documents are read-only.</p>
          <Divider />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

MineDocuments.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineDocuments);
