/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider, Tree } from "antd";
import { DownOutlined } from "@ant-design/icons";

/**
 * @class  MineDocuments - all documents pulled from MMS backdoor file system.
 */

const propTypes = {};
const treeData = [
  {
    title: "variances",
    key: "0-0",
    children: [
      { title: "document 0-0", key: "0-0-0", isLeaf: true },
      { title: "document 0-1", key: "0-0-1", isLeaf: true },
    ],
  },
  {
    title: "Dangerous Occurrence",
    key: "0-1",
    children: [
      { title: "document 1-0", key: "0-1-0", isLeaf: true },
      { title: "document 1-1", key: "0-1-1", isLeaf: true },
    ],
  },
  {
    title: "Inspections",
    key: "0-2",
    children: [
      { title: "document 1-0", key: "0-2-0", isLeaf: true },
      { title: "document 1-1", key: "0-2-1", isLeaf: true },
      { title: "document 1-2", key: "0-2-2", isLeaf: true },
      { title: "document 1-3", key: "0-2-3", isLeaf: true },
    ],
  },
  {
    title: "Permits",
    key: "0-3",
    children: [
      { title: "document 1-0", key: "0-3-0", isLeaf: true },
      { title: "document 1-1", key: "0-3-1", isLeaf: true },
    ],
  },
];

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
          <br />
          <Divider />
        </div>
        <Tree.DirectoryTree
          multiple
          defaultExpandAll
          switcherIcon={<DownOutlined />}
          onSelect={this.onSelect}
          onExpand={this.onExpand}
          treeData={treeData}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

MineDocuments.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineDocuments);
