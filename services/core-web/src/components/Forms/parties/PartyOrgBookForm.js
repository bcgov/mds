import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Row, Col, Select, Spin, Button } from "antd";
import { LoadingOutlined, BookOutlined, CheckCircleOutlined } from "@ant-design/icons";
import debounce, { isEmpty } from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  fetchPartyById,
  createPartyOrgBookEntity,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { searchOrgBook, fetchOrgBookCredential } from "@mds/common/redux/actionCreators/orgbookActionCreator";
import { getSearchOrgBookResults, getOrgBookCredential } from "@mds/common/redux/selectors/orgbookSelectors";
import CustomPropTypes from "@/customPropTypes";
import { ORGBOOK_ENTITY_URL } from "@/constants/routes";

const propTypes = {
  fetchPartyById: PropTypes.func.isRequired,
  searchOrgBook: PropTypes.func.isRequired,
  fetchOrgBookCredential: PropTypes.func.isRequired,
  createPartyOrgBookEntity: PropTypes.func.isRequired,
  searchOrgBookResults: PropTypes.arrayOf(PropTypes.any),
  orgBookCredential: PropTypes.objectOf(PropTypes.any),
  party: CustomPropTypes.party.isRequired,
};

const defaultProps = {
  searchOrgBookResults: [],
  orgBookCredential: {},
};

export class PartyOrgBookForm extends Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.handleSearchDebounced = (value) => debounce(this.handleSearch(value), 1000);
  }

  state = {
    options: [],
    credential: null,
    isSearching: false,
    isAssociating: false,
  };

  handleAssociateButtonClick = () => {
    this.setState({ isAssociating: true });
    this.props
      .createPartyOrgBookEntity(this.props.party.party_guid, {
        credential_id: this.state.credential.id,
      })
      .finally(() => {
        this.props.fetchPartyById(this.props.party.party_guid).finally(() => {
          this.setState({ isAssociating: false });
        });
      });
  };

  handleChange = () => {
    this.setState({
      isSearching: false,
    });
  };

  handleSelect = (value) => {
    const credentialId = value.key;
    this.props.fetchOrgBookCredential(credentialId).then(() => {
      this.setState({ credential: this.props.orgBookCredential });
    });
  };

  handleSearch(search) {
    if (search.length === 0) {
      return;
    }

    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ options: [], isSearching: true, credential: null });

    this.props.searchOrgBook(search).then(() => {
      if (fetchId !== this.lastFetchId) {
        return;
      }

      const selectOptions = this.props.searchOrgBookResults
        .filter((result) => result.names && result.names.length > 0)
        .map((result) => ({
          text: result.names[0].text,
          value: result.names[0].credential_id,
        }));
      this.setState({ options: selectOptions, isSearching: false });
    });
  }

  render() {
    const hasOrgBookCredential = !isEmpty(this.state.credential);

    return (
      <Row>
        <Col span={24}>
          <Form.Item>
            <Select
              virtual={false}
              showSearch
              showArrow
              labelInValue
              placeholder="Start typing to search OrgBook..."
              notFoundContent={
                this.state.isSearching ? (
                  <Spin size="small" indicator={<LoadingOutlined />} />
                ) : null
              }
              filterOption={false}
              onSearch={this.handleSearchDebounced}
              onChange={this.handleChange}
              onSelect={this.handleSelect}
              style={{ width: "100%" }}
              disabled={this.state.isAssociating}
            >
              {this.state.options.map((option) => (
                <Select.Option key={option.value}>{option.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Button
            className="full-mobile"
            href={
              hasOrgBookCredential
                ? ORGBOOK_ENTITY_URL(this.state.credential.topic.source_id)
                : null
            }
            target="_blank"
            disabled={!hasOrgBookCredential}
          >
            <span>
              <BookOutlined className="padding-sm--right" />
              View on OrgBook
            </span>
          </Button>
          <Button
            type="primary"
            className="full-mobile"
            disabled={!hasOrgBookCredential}
            onClick={this.handleAssociateButtonClick}
            loading={this.state.isAssociating}
          >
            <span>
              <CheckCircleOutlined className="padding-sm--right" />
              Associate
            </span>
          </Button>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  searchOrgBookResults: getSearchOrgBookResults(state),
  orgBookCredential: getOrgBookCredential(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyById,
      searchOrgBook,
      fetchOrgBookCredential,
      createPartyOrgBookEntity,
    },
    dispatch
  );

PartyOrgBookForm.propTypes = propTypes;
PartyOrgBookForm.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PartyOrgBookForm);
