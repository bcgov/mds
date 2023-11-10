import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Action, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";
import * as Strings from "@common/constants/strings";
import {
  getMineRegionHash,
  getMineRegionDropdownOptions,
  getDropdownNoticeOfWorkApplicationStatusOptions,
  getDropdownNoticeOfWorkApplicationTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { fetchNoticeOfWorkApplications } from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWorkList,
  getNoticeOfWorkPageData,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import * as routes from "@/constants/routes";
import NoticeOfWorkTable from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkTable";
import NoticeOfWorkSearch from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkSearch";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import { PageTracker } from "@common/utils/trackers";
import { INoticeOfWorkApplication, IPageData, IOption, INoticeOfWork } from "@mds/common";
import { RootState } from "@/App";

export interface NoWSearchParams {
  page?: string;
  per_page: string;
  sort_field: string;
  sort_dir: string;
  mine_search: string;
  now_number: string;
  mine_name: string;
  application_type: string;
  originating_system: string[];
  lead_inspector_name: string;
  issuing_inspector_name: string;
  now_application_status_description: string[];
  notice_of_work_type_description: string[];
  mine_region: string[];
}

interface NoticeOfWorkHomePageProps {
  fetchNoticeOfWorkApplications: (params: NoWSearchParams) => Promise<INoticeOfWork>;
  pageData: IPageData<INoticeOfWork>;
  noticeOfWorkApplications: INoticeOfWork[];
  mineRegionHash: object;
  mineRegionOptions: IOption;
  applicationTypeOptions: IOption;
  applicationStatusOptions: IOption;
}

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

export const NoticeOfWorkHomePage = (props: NoticeOfWorkHomePageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const history = useHistory();
  const { search } = useLocation();

  const initialParams = queryString.parse(search);
  const [params, setParams] = useState({ ...defaultParams, ...initialParams });

  const renderDataFromURL = (newParams: string) => {
    const parsedParams = queryString.parse(newParams);
    props.fetchNoticeOfWorkApplications(parsedParams).then(() => {
      setIsLoaded(true);
    });
  };

  const onPageChange = (page: number, per_page: number) => {
    const newParams = { ...params, page, per_page };
    setParams(newParams);
  };

  const handleSearch = (searchParams: NoWSearchParams) => {
    const newParams = { ...searchParams, page: defaultParams.page };
    setParams(newParams);
  };

  useEffect(() => {
    setIsLoaded(false);
    renderDataFromURL(search);
  }, [search]);

  useEffect(() => {
    history.replace(routes.NOTICE_OF_WORK_APPLICATIONS.dynamicRoute(params));
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

const mapStateToProps = (state: RootState) => ({
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  pageData: getNoticeOfWorkPageData(state),
  mineRegionHash: getMineRegionHash(state),
  mineRegionOptions: getMineRegionDropdownOptions(state),
  applicationStatusOptions: getDropdownNoticeOfWorkApplicationStatusOptions(state),
  applicationTypeOptions: getDropdownNoticeOfWorkApplicationTypeOptions(state, false),
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
  bindActionCreators(
    {
      fetchNoticeOfWorkApplications,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(NoticeOfWorkHomePage);
