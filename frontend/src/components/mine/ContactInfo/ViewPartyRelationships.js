import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, Row, Col, Select } from "antd";
import RenderSelect from "@/components/common/RenderSelect";

import ConditionalButton from "@/components/common/ConditionalButton";
import { modalConfig } from "@/components/modalContent/config";
import * as String from "@/constants/strings";
import * as ModalContent from "@/constants/modalContent";

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  /*     closeModal: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handlePartySubmit: PropTypes.func.isRequired,
    fetchMineRecordById: PropTypes.func.isRequired,
    fetchParties: PropTypes.func.isRequired,
    addPermittee: PropTypes.func.isRequired,
    mine: PropTypes.object.isRequired,
    permittees: PropTypes.object,
    permitteeIds: PropTypes.array */
};

const defaultProps = {
  partyTypeOptions: [
    {
      value: "EoR",
      label: "Engineer on Record",
    },
    {
      value: "MM",
      label: "Mine Manager",
    },
  ],
  /*
    permittees: {},
    permitteeIds: [], */
};

export class ViewPermittee extends Component {
  onSubmitAddPartyRelationship = (values) => {
    /*     this.props
      .addPartyRelationship(
        this.props.mine.guid,
        values.mineManager,
        this.props.mine.mine_detail[0].mine_name,
        values.startDate
      )
      .then(() => { */
    this.props.fetchMineRecordById(this.props.mine.guid);
    this.props.closeModal();
    /*       }); */
  };

  onPartySubmit = (values) => {
    this.props.handlePartySubmit(values, ModalContent.PERSON);
  };

  openAddPartyRelationshipModal = (value, onSubmit, handleChange, onPartySubmit, title) => {
    this.props.openModal({
      props: {
        onSubmit,
        handleChange,
        onPartySubmit,
        title: title + ": " + this.props.partyTypeOptions.find((x) => x.value === value).label,
      },
      content: modalConfig.ADD_PARTY_RELATIONSHIP,
    });
  };

  render() {
    const {
      /* permittees, permitteeIds, mine */
    } = this.props;

    return (
      <div>
        <Card>
          <Row gutter={16}>
            <Col span={6}>
              <Select
                id="addContactSelect"
                onChange={(value) => {
                  this.openAddPartyRelationshipModal(
                    value,
                    this.onSubmitAddPartyRelationship,
                    this.props.handleChange,
                    this.onPartySubmit,
                    ModalContent.ADD_CONTACT
                  );
                  this.value = null;
                }}
                style={{ width: "100%" }}
                placeholder="Add a Contact"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {this.props.partyTypeOptions.map((value) => (
                  <Select.Option key={value.value} value={value.value}>
                    {value.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
          <br />
          {/* <Row gutter={16}>
            <Col span={6}>
              <h3>Code-Required Reports</h3>
            </Col>
            <Col span={6}>
              <h3>Due Date</h3>
            </Col>
            <Col span={6}>
              <h3>Recieved</h3>
            </Col>
            <Col span={6}>
              <h3>Review Status</h3>
            </Col>
          </Row> */}
        </Card>
      </div>
    );
  }
}

ViewPermittee.propTypes = propTypes;
ViewPermittee.defaultProps = defaultProps;

export default ViewPermittee;
