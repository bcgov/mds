import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { change } from "redux-form";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { fetchParties, createParty } from "@mds/common/redux/actionCreators/partiesActionCreator";
import {
  getDropdownProvinceOptions,
  getPartyRelationshipTypeHash,
  getPartyRelationshipTypesList,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getParties, getPartyPageData } from "@mds/common/redux/selectors/partiesSelectors";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import ContactSearch from "@/components/dashboard/contactsHomePage/ContactSearch";
import ContactList from "@/components/dashboard/contactsHomePage/ContactList";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as routes from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import AddButton from "@/components/common/buttons/AddButton";
import { PageTracker } from "@common/utils/trackers";

/**
 * @class ContactHomePage contains a list, contact search, and create new contact button
 *
 */

const propTypes = {
  fetchParties: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  pageData: PropTypes.objectOf(CustomPropTypes.partyPageData).isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  parties: PropTypes.objectOf(CustomPropTypes.party).isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  relationshipTypeHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultParams = {
  page: Strings.DEFAULT_PAGE,
  per_page: Strings.DEFAULT_PER_PAGE,
  type: "PER",
  relationships: "mine_party_appt",
};

export class ContactHomePage extends Component {
  state = {
    params: defaultParams,
    isLoaded: false,
  };

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    this.setState(
      (prevState) => ({
        params: {
          ...prevState.params,
          ...params,
        },
      }),
      () => this.props.history.replace(routes.CONTACT_HOME_PAGE.dynamicRoute(this.state.params))
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.renderDataFromURL(nextProps.location.search);
    }
  }

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    this.setState(
      {
        params: { ...defaultParams, ...parsedParams },
        isLoaded: false,
      },
      () =>
        this.props.fetchParties(this.state.params).then(() => {
          this.setState({ isLoaded: true });
        })
    );
  };

  handleSearch = (searchParams = {}, clear = false) => {
    const persistedParams = clear ? defaultParams : this.state.params;
    const params = {
      ...persistedParams,
      ...searchParams,
    };
    this.props.history.replace(routes.CONTACT_HOME_PAGE.dynamicRoute(params));
  };

  onPageChange = (page, per_page) => {
    this.props.history.replace(
      routes.CONTACT_HOME_PAGE.dynamicRoute({
        ...this.state.params,
        page,
        per_page,
      })
    );
  };

  handleNameFieldReset = () => {
    this.props.change(FORM.CONTACT_ADVANCED_SEARCH, "party_name", undefined);
    this.props.change(FORM.CONTACT_ADVANCED_SEARCH, "first_name", undefined);
    this.props.change(FORM.CONTACT_ADVANCED_SEARCH, "last_name", undefined);
  };

  openAddContactModal(event, fetchData, title, provinceOptions) {
    event.preventDefault();
    this.props.openModal({
      props: {
        fetchData,
        title,
        provinceOptions,
        partyRelationshipTypesList: this.props.partyRelationshipTypesList,
      },
      width: "75vw",
      content: modalConfig.ADD_CONTACT,
    });
  }

  render() {
    const { page, per_page } = this.state.params;
    return (
      <div className="landing-page">
        <PageTracker title="Contacts Page" />
        <div className="landing-page__header">
          <div className="inline-flex between center-mobile">
            <div>
              <h1>Contact Lookup</h1>
              <p>To find a contact profile, search in the list section below.</p>
            </div>
            <AuthorizationWrapper permission={Permission.EDIT_PARTIES}>
              <AddButton
                onClick={(event) =>
                  this.openAddContactModal(
                    event,
                    this.renderDataFromURL,
                    ModalContent.ADD_CONTACT,
                    this.props.provinceOptions
                  )
                }
              >
                {ModalContent.ADD_CONTACT}
              </AddButton>
            </AuthorizationWrapper>
          </div>
        </div>
        <div className="landing-page__content">
          <ContactSearch
            handleNameFieldReset={this.handleNameFieldReset}
            initialValues={this.state.params}
            partyRelationshipTypesList={this.props.partyRelationshipTypesList}
            fetchParties={this.props.fetchParties}
            handleSearch={this.handleSearch}
          />
          <div>
            <div className="tab__content">
              <ContactList
                isLoaded={this.state.isLoaded}
                parties={this.props.parties}
                relationshipTypeHash={this.props.relationshipTypeHash}
                handleSearch={this.handleSearch}
                sortField={this.state.params.sort_field}
                sortDir={this.state.params.sort_dir}
              />
            </div>
            <div className="center">
              <ResponsivePagination
                onPageChange={this.onPageChange}
                currentPage={Number(page)}
                pageTotal={Number(this.props.pageData.total)}
                itemsPerPage={Number(per_page)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  parties: getParties(state),
  pageData: getPartyPageData(state),
  provinceOptions: getDropdownProvinceOptions(state),
  relationshipTypeHash: getPartyRelationshipTypeHash(state),
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchParties,
      createParty,
      openModal,
      closeModal,
      change,
    },
    dispatch
  );

ContactHomePage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ContactHomePage);
