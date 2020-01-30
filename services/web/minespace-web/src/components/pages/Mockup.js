import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Tabs,
  Table,
  Typography,
  Input,
  InputNumber,
  Select,
  Icon,
  Modal,
  Descriptions,
  TimePicker,
  Tooltip,
  Switch,
  Checkbox,
  Tag,
  Radio,
  notification,
} from "antd";
import moment from "moment";
import * as Strings from "@/constants/strings";

const { TabPane } = Tabs;
const { Text, Title, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;

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

const openNotificationWithIcon = (type) => {
  notification[type]({
    message: "Notification Title",
    description:
      "This is the content of the notification. This is the content of the notification. This is the content of the notification.",
  });
};

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

function showConfirm() {
  confirm({
    title: "Do you want to delete these items?",
    content: "The items will become permanently deleted and cannot be recovered.",
    onOk() {
      return new Promise((resolve, reject) => {
        setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
      }).catch(() => {});
    },
    onCancel() {},
  });
}

class Mockup extends Component {
  state = { modalVisible: false, radioValue: 1 };

  showModal = () => {
    this.setState({
      modalVisible: true,
    });
  };

  handleModalOk = () => {
    this.setState({
      modalVisible: false,
    });
  };

  handleModalCancel = () => {
    this.setState({
      modalVisible: false,
    });
  };

  onRadioChange = (e) => {
    this.setState({
      radioValue: e.target.value,
    });
  };

  render() {
    return (
      <div>
        <br />
        <br />
        <h1>Various Typography (Title, Text, etc)</h1>
        <div>
          {/* https://ant.design/components/typography/ */}
          <Title>h1. Ant Design Title</Title>
          <Title level={2}>h2. Ant Design Title</Title>
          <Title level={3}>h3. Ant Design Title</Title>
          <Title level={4}>h4. Ant Design Title</Title>
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
          <br />
          <br />
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed erat faucibus,
            eleifend enim et, faucibus ligula. Maecenas lorem ex, dignissim sit amet maximus vel,
            gravida imperdiet velit. Morbi consequat, augue et pulvinar condimentum, nunc urna
            congue diam, at tempus justo eros non leo. Vivamus auctor vitae tortor eget sodales.
            Nunc elementum, neque non semper accumsan, enim risus pellentesque enim, ut vulputate
            risus diam sed neque. Proin volutpat justo quis dictum malesuada. Etiam egestas felis
            non ligula vehicula ornare. Praesent vel lacus eget nulla feugiat egestas quis nec nisi.
            Suspendisse potenti. Vestibulum porta velit suscipit vehicula hendrerit. Vestibulum ante
            ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Phasellus
            fringilla ornare justo, at commodo mauris euismod vitae.
          </Paragraph>
        </div>

        <br />
        <br />
        {/* https://ant.design/components/tag/ */}
        <h1>Tags</h1>
        <div>
          <Tag>Tag</Tag>
          <Tag>
            <a href="https://github.com/ant-design/ant-design/issues/1862">Link</a>
          </Tag>
          <Tag closable>Closable</Tag>
          <Tag closable onClose={(e) => e.preventDefault()}>
            Prevent Default
          </Tag>
        </div>

        <br />
        <br />
        <h1>Links</h1>
        {/* https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/Link.md */}
        <Link to={{}}>Link to Home</Link>
        <span style={{ paddingRight: 12 }} />
        <Link to={{}} disabled>
          Link to Home
        </Link>

        <br />
        <br />
        {/* https://ant.design/components/button/ */}
        <h1>Buttons</h1>
        <Button type="primary">Primary Button</Button>
        <span style={{ paddingRight: 12 }} />
        <Button type="primary" disabled>
          Primary Button
        </Button>
        <br />
        <br />
        <Button>Default Button</Button>
        <span style={{ paddingRight: 12 }} />
        <Button disabled>Default Button</Button>
        <br />
        <br />
        <Button type="danger">Danger Button</Button>
        <span style={{ paddingRight: 12 }} />
        <Button type="danger" disabled>
          Danger Button
        </Button>
        <br />
        <br />
        <Button type="primary">
          <Icon type="plus-circle" theme="filled" />
          Add Stuff
        </Button>
        <span style={{ paddingRight: 12 }} />
        <Button type="primary" disabled>
          <Icon type="plus-circle" theme="filled" />
          Add Stuff
        </Button>
        <br />
        <br />
        <Button>
          <Icon type="minus-circle" theme="filled" />
          Remove Stuff
        </Button>
        <span style={{ paddingRight: 12 }} />
        <Button disabled>
          <Icon type="minus-circle" theme="filled" />
          Remove Stuff
        </Button>

        <br />
        <br />
        {/* https://ant.design/components/tooltip/ */}
        <Tooltip placement="right" title="This is a tooltip!">
          <Button>Button Tooltip</Button>
        </Tooltip>

        <br />
        <br />
        {/* https://ant.design/components/descriptions/ */}
        <h1>Descriptions</h1>
        <Descriptions title="User Info" colon={false}>
          <Descriptions.Item label="UserName">Zhou Maomao</Descriptions.Item>
          <Descriptions.Item label="Telephone">1810000000</Descriptions.Item>
          <Descriptions.Item label="Live">Hangzhou, Zhejiang</Descriptions.Item>
          <Descriptions.Item label="Remark">empty</Descriptions.Item>
          <Descriptions.Item label="Address">
            No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
          </Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <h1>Data Entry (Various Components)</h1>
        <div style={{ width: 300 }}>
          {/* https://ant.design/components/input/ */}
          <Input placeholder="Placeholder text..." />
          <br />
          <br />
          <Input placeholder="Placeholder text..." disabled />
          <br />
          <br />
          {/* https://ant.design/components/input/#components-input-demo-textarea */}
          <TextArea rows={4} />
          <br />
          <br />
          <TextArea rows={4} disabled />
          <br />
          <br />
          {/* https://ant.design/components/select/ */}
          <Select
            style={{ width: "100%" }}
            placeholder="Please select"
            defaultValue={["a10"]}
            menuItemSelectedIcon={<Icon type="check-circle" theme="filled" />}
          >
            {children}
          </Select>
          <br />
          <br />
          <Select
            style={{ width: "100%" }}
            placeholder="Please select"
            defaultValue={["a10"]}
            menuItemSelectedIcon={<Icon type="check-circle" theme="filled" />}
            disabled
          >
            {children}
          </Select>
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
          <br />
          <br />
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Please select"
            defaultValue={["a10", "c12"]}
            menuItemSelectedIcon={<Icon type="check-circle" theme="filled" />}
            disabled
          >
            {children}
          </Select>
        </div>

        <br />
        {/* https://ant.design/components/input-number/ */}
        <InputNumber min={1} max={10} defaultValue={3} />
        <br />
        <br />
        <InputNumber min={1} max={10} defaultValue={3} disabled />

        <br />
        <br />
        {/* https://ant.design/components/switch/ */}
        <Switch defaultChecked />
        <br />
        <br />
        <Switch defaultChecked disabled />

        <br />
        <br />
        {/* https://ant.design/components/checkbox/ */}
        <Checkbox>Checkbox</Checkbox>
        <br />
        <br />
        <Checkbox disabled>Checkbox</Checkbox>

        <br />
        <br />
        {/* https://ant.design/components/radio/ */}
        <Radio.Group onChange={this.onRadioChange} value={this.state.radioValue}>
          <Radio value={1}>A</Radio>
          <Radio value={2}>B</Radio>
          <Radio value={3}>C</Radio>
          <Radio value={4}>D</Radio>
          <Radio value={5} disabled>
            E
          </Radio>
        </Radio.Group>

        <br />
        <br />
        {/* https://ant.design/components/time-picker/ */}
        <TimePicker defaultOpenValue={moment("00:00:00", "HH:mm:ss")} />

        <br />
        <br />
        <br />
        <h1>Cards</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
          }}
        >
          {/* https://ant.design/components/card/ */}
          <Card title="Card Title" style={{ width: 300 }}>
            <Paragraph>
              Vivamus auctor vitae tortor eget sodales. Nunc elementum, neque non semper accumsan,
              enim risus pellentesque enim, ut vulputate risus diam sed neque.
            </Paragraph>
          </Card>
          <Card title="Questions?" style={{ width: 300 }} headStyle={{ textAlign: "center" }}>
            <Paragraph>
              We encourage your feedback and would like to hear from you. If you have any questions,
              feedback, or other concerns, please send us an email at&nbsp;
              <a className="underline" href={`mailto:${Strings.MDS_EMAIL}`}>
                {Strings.MDS_EMAIL}
              </a>
              .
            </Paragraph>
          </Card>
        </div>

        <br />
        <br />
        {/* https://ant.design/components/tabs/ */}
        <h1>Tabs</h1>
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
          <TabPane tab="Tab 4" key="4">
            Content of Tab Pane 4
          </TabPane>
          <TabPane tab="Tab 5" key="5">
            Content of Tab Pane 5
          </TabPane>
          <TabPane tab="Tab 6" key="6">
            Content of Tab Pane 6
          </TabPane>
        </Tabs>

        <br />
        <br />
        {/* https://ant.design/components/table/ */}
        <h1>Tables</h1>
        <Table
          // title={() => "Table Title"}
          size="small"
          columns={columns}
          expandedRowRender={(record) => <p style={{ margin: 0 }}>{record.description}</p>}
          dataSource={data}
        />
        <Table loading size="small" columns={columns} dataSource={data} pagination={false} />

        <br />
        <br />
        {/* https://ant.design/components/modal/ */}
        <h1>Modals</h1>
        <div>
          <Button type="primary" onClick={this.showModal}>
            Open Modal
          </Button>
          <Modal
            title="Basic Modal"
            visible={this.state.modalVisible}
            onOk={this.handleModalOk}
            onCancel={this.handleModalCancel}
          >
            <Paragraph>Some contents...</Paragraph>
            <Paragraph>Some contents...</Paragraph>
            <Paragraph>
              The buttons look weird for now due to how we use a modal wrapper...
            </Paragraph>
          </Modal>
        </div>
        <br />
        <Button onClick={showConfirm}>Confirm</Button>

        <br />
        <br />
        {/* https://ant.design/components/modal/ */}
        <h1>Notifications</h1>
        <div>
          <Button onClick={() => openNotificationWithIcon("success")}>Success</Button>
          <span style={{ paddingRight: 12 }} />
          <Button onClick={() => openNotificationWithIcon("info")}>Info</Button>
          <span style={{ paddingRight: 12 }} />
          <Button onClick={() => openNotificationWithIcon("warning")}>Warning</Button>
          <span style={{ paddingRight: 12 }} />
          <Button onClick={() => openNotificationWithIcon("error")}>Error</Button>
        </div>
      </div>
    );
  }
}

export default Mockup;
