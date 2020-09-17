import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider, Tree, Input, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";

/**
 * @class  MineDocuments - all documents pulled from MMS backdoor file system.
 */

const propTypes = {};
const treeData = [
  {
    title: "parent 1",
    key: "0-0",
    children: [
      {
        title: "parent 1-0",
        key: "0-0-0",
        children: [
          {
            title: "leaf",
            key: "0-0-0-0",
          },
          {
            title: "leaf",
            key: "0-0-0-1",
          },
          {
            title: "leaf",
            key: "0-0-0-2",
          },
        ],
      },
      {
        title: "parent 1-1",
        key: "0-0-1",
        children: [
          {
            title: "leaf",
            key: "0-0-1-0",
          },
        ],
      },
      {
        title: "parent 1-2",
        key: "0-0-2",
        children: [
          {
            title: "leaf",
            key: "0-0-2-0",
          },
          {
            title: "leaf",
            key: "0-0-2-1",
          },
        ],
      },
    ],
  },
];

const x = 3;
const y = 2;
const z = 1;
const gData = [];

const dataList = [];
const generateList = (data) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { key } = node;
    dataList.push({ key, title: key });
    if (node.children) {
      generateList(node.children);
    }
  }
};
generateList(treeData);

const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

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

  onChange = (e) => {
    console.log("is this doing anything??");
    const { value } = e.target;
    const expandedKeys = dataList
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, treeData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  };

  render() {
    const loop = (data) =>
      data.map((item) => {
        const index = item.title.indexOf(this.state.searchValue);
        const beforeStr = item.title.substr(0, index);
        const afterStr = item.title.substr(index + this.state.searchValue.length);
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span className="site-tree-search-value">{this.state.searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span>{item.title}</span>
          );
        if (item.children) {
          return { title, key: item.key, children: loop(item.children) };
        }

        return {
          title,
          key: item.key,
        };
      });
    return (
      <div className="tab__content">
        <div>
          <h2>MMS Backdoor Documents</h2>
          <p>MMS Historical documents are available on this page. These documents are read-only.</p>
          <br />
          <Divider />
        </div>
        <Row gutter={48} justify="center">
          <Col span={12}>
            <Input.Search
              style={{ marginBottom: 8 }}
              placeholder="Search by File Name"
              onChange={this.onChange}
            />
          </Col>
        </Row>
        <Tree.DirectoryTree
          multiple
          showIcon
          switcherIcon={<DownOutlined />}
          autoExpandParent={this.state.autoExpandParent}
          expandedKeys={this.state.expandedKeys}
          onSelect={this.onSelect}
          onExpand={this.onExpand}
          treeData={loop(treeData)}
          draggable
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

MineDocuments.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineDocuments);
