import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Card, Row, Col, Select } from "antd";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";

import {
  fetchPartyRelationshipTypes,
  addPartyRelationship,
} from "@/actionCreators/partiesActionCreator";
import { getPartyRelationshipTypes } from "@/selectors/partiesSelectors";

const propTypes = {
  mine: PropTypes.object.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  partyRelationshipTypes: PropTypes.array.isRequired,
  selectedPartyRelationshipType: PropTypes.object,
  addPartyRelationship: PropTypes.func.isRequired,
};

export class ViewPartyRelationships extends Component {
  componentWillMount() {
    this.props.fetchPartyRelationshipTypes();
  }

  onSubmitAddPartyRelationship = (values) => {
    const payload = {
      mine_guid: this.props.mine.guid,
      party_guid: values.party_guid,
      mine_party_appt_type_code: this.props.selectedPartyRelationshipType,
      mine_tailings_storage_facility_guid: values.mine_tailings_storage_facility_guid,
      start_date: values.start_date,
      end_date: values.end_date,
    };

    this.props.addPartyRelationship(payload).then(() => {
      this.props.fetchMineRecordById(this.props.mine.guid);
      this.props.closeModal();
    });
  };

  onPartySubmit = (values) => {
    this.props.handlePartySubmit(values, ModalContent.PERSON);
  };

  openAddPartyRelationshipModal = (value, onSubmit, handleChange, onPartySubmit, title, mine) => {
    this.props.openModal({
      props: {
        onSubmit,
        handleChange,
        onPartySubmit,
        title: `${title}: ${
          this.props.partyRelationshipTypes.find((x) => x.value === value).label
        }`,
        partyType: value,
        mine,
      },
      content: modalConfig.ADD_PARTY_RELATIONSHIP,
    });
  };

  render() {
    const {} = this.props;

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
                    ModalContent.ADD_CONTACT,
                    this.props.mine
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
                {this.props.partyRelationshipTypes.map((value) => (
                  <Select.Option key={value.value} value={value.value}>
                    {value.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
          <br />
          <Row gutter={16}>
            <Col span={6}>
              <h3 />
            </Col>
            <Col span={6}>
              <h3 />
            </Col>
            <Col span={6}>
              <h3 />
            </Col>
            <Col span={6}>
              <h3 />
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  partyRelationshipTypes: getPartyRelationshipTypes(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyRelationshipTypes,
      addPartyRelationship,
    },
    dispatch
  );

ViewPermittee.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewPartyRelationships);
