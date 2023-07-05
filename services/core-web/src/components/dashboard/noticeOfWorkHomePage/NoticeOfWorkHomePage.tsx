import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as Strings from "@common/constants/strings";
import {
  getMineRegionHash,
  getMineRegionDropdownOptions,
  getDropdownNoticeOfWorkApplicationStatusOptions,
  getDropdownNoticeOfWorkApplicationTypeOptions,
} from "@common/selectors/staticContentSelectors";
import { fetchNoticeOfWorkApplications } from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWorkList,
  getNoticeOfWorkPageData,
} from "@common/selectors/noticeOfWorkSelectors";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import NoticeOfWorkTable from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkTable";
import NoticeOfWorkSearch from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkSearch";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import { PageTracker } from "@common/utils/trackers";

const propTypes = {
  fetchNoticeOfWorkApplications: PropTypes.func.isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  pageData: CustomPropTypes.pageData.isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.importedNOWApplication).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  applicationStatusOptions: CustomPropTypes.options.isRequired,
  applicationTypeOptions: CustomPropTypes.options.isRequired,
};

const defaultParams = {
  page: Strings.DEFAULT_PAGE,
  per_page: Strings.DEFAULT_PER_PAGE,
  sort_field: "received_date",
  sort_dir: "desc",
  mine_search: undefined,
  now_number: undefined,
  mine_name: undefined,
  application_type: "NOW",
  originating_system: [],
  lead_inspector_name: undefined,
  issuing_inspector_name: undefined,
  now_application_status_description: [],
  notice_of_work_type_description: [],
  mine_region: [],
};

export const NoticeOfWorkHomePage = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { search } = useLocation();

  const initialParams = queryString.parse(search);
  console.log("initialParams", initialParams);
  const [params, setParams] = useState({ ...defaultParams, ...initialParams });

  const renderDataFromURL = (newParams) => {
    const parsedParams = queryString.parse(newParams);
    props.fetchNoticeOfWorkApplications(parsedParams).then(() => {
      setIsLoaded(true);
    });
  };

  const onPageChange = (page, per_page) => {
    const newParams = { ...params, page, per_page };
    setParams(newParams);
  };

  const handleSearch = (searchParams) => {
    const newParams = { ...searchParams, page: defaultParams.page };
    setParams(newParams);
  };

  useEffect(() => {
    setIsLoaded(false);
    renderDataFromURL(search);
  }, [search]);

  useEffect(() => {
    props.history.replace(routes.NOTICE_OF_WORK_APPLICATIONS.dynamicRoute(params));
  }, [params]);

  return (
    <div className="landing-page">
      <PageTracker title="NoW Page" />
      <div className="landing-page__header">
        <div>
          <h1>Browse Notices of Work</h1>
        </div>
      </div>
      <div className="landing-page__content">
        <div className="page__content">
          <NoticeOfWorkSearch
            handleSearch={handleSearch}
            searchParams={params}
            initialValues={{ mine_search: params.mine_search }}
          />
          <div>
            <div className="tab__content">
              <NoticeOfWorkTable
                isLoaded={isLoaded}
                handleSearch={handleSearch}
                noticeOfWorkApplications={props.noticeOfWorkApplications}
                sortField={params.sort_field}
                sortDir={params.sort_dir}
                searchParams={params}
                defaultParams={defaultParams}
                mineRegionHash={props.mineRegionHash}
                mineRegionOptions={props.mineRegionOptions}
                applicationStatusOptions={props.applicationStatusOptions}
                applicationTypeOptions={props.applicationTypeOptions}
              />
              <div className="center">
                <ResponsivePagination
                  onPageChange={onPageChange}
                  currentPage={Number(params.page)}
                  pageTotal={Number(props.pageData.total)}
                  itemsPerPage={Number(params.per_page)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  pageData: getNoticeOfWorkPageData(state),
  mineRegionHash: getMineRegionHash(state),
  mineRegionOptions: getMineRegionDropdownOptions(state),
  applicationStatusOptions: getDropdownNoticeOfWorkApplicationStatusOptions(state),
  applicationTypeOptions: getDropdownNoticeOfWorkApplicationTypeOptions(state, false),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticeOfWorkApplications,
    },
    dispatch
  );

NoticeOfWorkHomePage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NoticeOfWorkHomePage);
