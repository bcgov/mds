import React, { FC, useState, useEffect, useRef } from "react";
import { Row, Col } from "antd";
import { isEmpty, some, negate } from "lodash";
import MajorProjectSearchForm from "@/components/Forms/MajorProject/MajorProjectSearchForm";

interface MajorProjectSearchProps {
  handleSearch: (params: any) => void;
  initialValues: any;
  handleReset: () => void;
}

export const MajorProjectSearch: FC<MajorProjectSearchProps> = ({
  handleSearch,
  initialValues,
  handleReset,
}) => {

  const [receivedFirstInitialValues, setReceivedFirstInitialValues] = useState(false);
  const [expandAdvancedSearch, setExpandAdvancedSearch] = useState(false);
  const previousInitialValues = useRef(initialValues);

  const haveAdvancedSearchFilters = ({ Update_timestamp }) =>
    Update_timestamp ||
    some([Update_timestamp], negate(isEmpty));

  useEffect(() => {
    if (!receivedFirstInitialValues && initialValues !== previousInitialValues.current) {
      setReceivedFirstInitialValues(true);
      setExpandAdvancedSearch(haveAdvancedSearchFilters(initialValues));
    }

    previousInitialValues.current = initialValues;
  }, [initialValues])

  const toggleIsAdvancedSearch = () => setExpandAdvancedSearch(!expandAdvancedSearch);

  return (
    <div>
      <Row>
        <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
          <span className="advanced-search__container">
            <MajorProjectSearchForm
              handleReset={handleReset}
              onSubmit={handleSearch}
              toggleAdvancedSearch={toggleIsAdvancedSearch}
              isAdvanceSearch={expandAdvancedSearch}
              initialValues={initialValues}
            />
          </span>
        </Col>
      </Row>
    </div>
  );
}

export default MajorProjectSearch;
