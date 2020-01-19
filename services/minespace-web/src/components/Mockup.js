import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, Tabs, Table, Typography, Input, Select, Icon } from "antd";
// import { Field, reduxForm, change } from "redux-form";
import * as routes from "@/constants/routes";

const { TabPane } = Tabs;
const { Text, Title } = Typography;
const { Option } = Select;

const columns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Age", dataIndex: "age", key: "age", sorter: true },
  { title: "Address", dataIndex: "address", key: "address" },
  {
    title: "Action",
    dataIndex: "",
    key: "x",
    render: () => <a>Delete</a>,
  },
];

const data = [
  {
    key: 1,
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    description: "My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.",
  },
  {
    key: 2,
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    description: "My name is Jim Green, I am 42 years old, living in London No. 1 Lake Park.",
  },
  {
    key: 3,
    name: "Joe Black",
    age: 32,
    address: "Sidney No. 1 Lake Park",
    description: "My name is Joe Black, I am 32 years old, living in Sidney No. 1 Lake Park.",
  },
];

const children = [];
for (let i = 10; i < 36; i += 1) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

export const Mockup = () => (
  <div>
    <br />
    <br />
    <div>
      <Title>h1. Ant Design</Title>
      <Title level={2}>h2. Ant Design</Title>
      <Title level={3}>h3. Ant Design</Title>
      <Title level={4}>h4. Ant Design</Title>
    </div>
    <br />
    <br />
    <div>
      Nothing.
      <br />
      <Text>Normal Ant Design</Text>
      <br />
      <Text type="secondary">Secondary Ant Design</Text>
      <br />
      <Text type="warning">Warning Ant Design</Text>
      <br />
      <Text type="danger">Danger Ant Design</Text>
      <br />
      <Text disabled>Disabled Ant Design</Text>
      <br />
      <Text mark>Mark Ant Design</Text>
      <br />
      <Text code>Code Ant Design</Text>
      <br />
      <Text underline>Underline Ant Design</Text>
      <br />
      <Text delete>Delete Ant Design</Text>
      <br />
      <Text strong>Strong Ant Design</Text>
    </div>
    <br />
    <br />
    <Link to={routes.HOME.route}>Link to Home</Link>
    <br />
    <br />
    <Button type="primary">Primary Button</Button>
    <br />
    <br />
    <Button>Default Button</Button>
    <br />
    <br />
    <Button type="link">Link Button</Button>
    <br />
    <br />
    <div style={{ width: 300 }}>
      <Input placeholder="Basic usage" />
      <br />
      <br />
      <Select
        mode="multiple"
        style={{ width: "100%" }}
        placeholder="Please select"
        defaultValue={["a10", "c12"]}
        menuItemSelectedIcon={<Icon type="check-circle" theme="filled" />}
      >
        {children}
      </Select>
    </div>
    <br />
    <br />
    <Card title="Card Title" bordered={false} style={{ width: 300 }}>
      <p>Card content.</p>
    </Card>
    <br />
    <br />
    <Tabs defaultActiveKey="1" type="card">
      <TabPane tab="Tab 1" key="1">
        Content of Tab Pane 1
      </TabPane>
      <TabPane tab="Tab 2" key="2">
        Content of Tab Pane 2
      </TabPane>
      <TabPane tab="Tab 3" key="3">
        Content of Tab Pane 3
      </TabPane>
    </Tabs>
    <br />
    <br />
    <Table
      columns={columns}
      expandedRowRender={(record) => <p style={{ margin: 0 }}>{record.description}</p>}
      dataSource={data}
    />
  </div>
);

export default Mockup;
