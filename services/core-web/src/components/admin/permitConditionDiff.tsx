import RenderField from "@mds/common/components/forms/RenderField";
import { Col, Form, Input, Row } from "antd";
import React from "react"
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Field } from "redux-form";

export const PermitConditionDiff = (props) => {

    const [permit1, setPermit1] = React.useState("");
    const [permit2, setPermit2] = React.useState("");

    const handleChange = (e) => {
        console.log(e);
    }

    return (

        <>
            <Form
                layout="vertical">
                <Row gutter={16}>
                    <Col md={12} sm={24}>
                        <Form.Item>
                            <Input.TextArea
                                rows={4}
                                placeholder="Permit #1 text"
                                showCount
                                onChange={e => setPermit1(e.target.value)}
                                name="permit1"
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} sm={24}>
                        <Form.Item>
                            <Input.TextArea
                                rows={4}
                                placeholder="permit #2 text"
                                showCount
                                onChange={e => setPermit2(e.target.value)}
                                name="permit2"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <ReactDiffViewer oldValue={permit1} newValue={permit2} splitView={true} />
        </>)

}

export default PermitConditionDiff;