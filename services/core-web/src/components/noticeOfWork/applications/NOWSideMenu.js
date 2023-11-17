import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { PropTypes } from "prop-types";
import { isEmpty } from "lodash";
import { connect } from "react-redux";
import { Anchor } from "antd";
import * as routes from "@/constants/routes";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import CustomPropTypes from "@/customPropTypes";
import { renderActivities, sideMenuOptions } from "@/constants/NOWConditions";
import { getDraftPermitAmendmentForNOW } from "@mds/common/redux/selectors/permitSelectors";

/**
 * @constant NOWSideMenu renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
    replace: PropTypes.func,
    action: PropTypes.string,
    location: PropTypes.shape({ hash: PropTypes.string }),
  }).isRequired,
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  tabSection: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
};

const defaultProps = {};

export class NOWSideMenu extends Component {
  state = { showNested: false };

  // eslint-disable-next-line react/sort-comp
  static urlRoute = undefined;

  componentDidMount() {
    // If the user loads the page with a hash in the URL, start them off at the corresponding NoW section.
    // Note: Because Keycloak authorization adds params to the URL when it redirects, props.location.hash
    // will be contaminated with extra params that we don't need. All we want is the hash that corresponds
    // to the NoW section, so we must parse it out. If the hash is "#state", we must ignore it (see example).
    // For example: #blasting&state=bd74ea1c-09e5-4d7e-810f-d3558969293a&session_state=1c577088-15a8-4ae2-...
    let link =
      this.props.location &&
        this.props.location.hash &&
        !this.props.location.hash.startsWith("#state")
        ? this.props.location.hash
        : undefined;

    if (!link) {
      return;
    }

    // Extracts "#blasting" from "#blasting&state=bd74ea1c-09e5-4d7e-810f-d...", for example.
    if (link.includes('&')) {
      link = link.substr(0, link.indexOf("&"));
    }
    this.updateUrlRoute(link);
    document.querySelector(link)?.scrollIntoView()
  }

  handleAnchorOnClick = (e, link) => {
    e.preventDefault();
    this.handleNested(link.href.substring(1));
    this.updateUrlRoute(link.href);
  };

  handleAnchorOnChange = (currentActiveLink) => {
    this.handleNested(currentActiveLink.substring(1));
    if (
      (this.props.history.action === "POP" &&
        currentActiveLink === this.props.history.location.hash) ||
      this.props.match.params.tab !== this.props.tabSection
    ) {
      return;
    }

    this.props.history.replace(this.urlRoute, { currentActiveLink });
  };

  updateUrlRoute = (route) => {
    const nowGuid = this.props.match.params.id;
    const nowRoute = this.props.noticeOfWork.is_historic
      ? routes.VIEW_NOTICE_OF_WORK_APPLICATION
      : routes.NOTICE_OF_WORK_APPLICATION;
    const applicationRoute =
      this.props.noticeOfWork.application_type_code === "NOW"
        ? nowRoute
        : routes.ADMIN_AMENDMENT_APPLICATION;
    this.urlRoute = applicationRoute.hashRoute(nowGuid, this.props.tabSection, route);

    if (route === this.props.history.location.hash) {
      return;
    }

    this.props.history.push(this.urlRoute, { currentActiveLink: route });
  };

  handleNested = (link) => {
    // gets the children if they exist
    const getChildren = sideMenuOptions(this.props.tabSection).filter(
      ({ children }) => children?.length > 0
    )[0]?.children;
    // checks if child href matches what was clicked
    const values = getChildren?.filter(({ href }) => link === href);
    // checks if children exist
    const obj = sideMenuOptions(this.props.tabSection).filter(({ href }) => link === href)[0];
    const show = obj?.children?.length > 0 || values?.length > 0;
    this.setState({ showNested: show });
  };

  render() {
    // default to true, as the preferred flow has permit conditions.
    const hasPermitConditionsFlow = !isEmpty(this.props.draftPermitAmendment)
      ? this.props.draftPermitAmendment.has_permit_conditions
      : true;
    return (
      <div>
        <Anchor
          affix={false}
          offsetTop={160}
          onChange={this.handleAnchorOnChange}
          onClick={this.handleAnchorOnClick}
        >
          {sideMenuOptions(this.props.tabSection, hasPermitConditionsFlow)
            .filter(
              ({ href, alwaysVisible, applicationType }) =>
                (alwaysVisible ||
                  renderActivities(this.props.noticeOfWork.notice_of_work_type_code, href)) &&
                applicationType &&
                applicationType.includes(this.props.noticeOfWork.application_type_code)
            )
            .map(({ href, title, children }) => (
              <Anchor.Link href={`#${href}`} title={title} className="now-menu-link">
                {children &&
                  children.length > 1 &&
                  this.state.showNested &&
                  children.map((child) => (
                    <Anchor.Link
                      href={`#${child.href}`}
                      title={child.title}
                      className="now-menu-link"
                    />
                  ))}
              </Anchor.Link>
            ))}
        </Anchor>
      </div>
    );
  }
}

NOWSideMenu.propTypes = propTypes;
NOWSideMenu.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
});

export default withRouter(connect(mapStateToProps)(NOWSideMenu));
