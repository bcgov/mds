/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import AmazonS3Provider from "@/components/syncfusion/AmazonS3Provider";

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
          <h2>Archived MMS Files</h2>
          <p>Archived MMS files are available on this page. These documents are read-only.</p>
          <Divider />
          <AmazonS3Provider />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

MineDocuments.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineDocuments);
