import React from "react";
import { render } from "@testing-library/react";
import { PermitReviewBanner } from "@mds/common/components/permits/PermitReviewBanner";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const initialState = {
  [AUTHENTICATION]: { systemFlag: SystemFlagEnum.core },
};

it("renders correctly", () => {
  const height = 30;
  const { container } = render(
    <ReduxWrapper initialState={initialState}>
      <p>AI: review complete</p>
      <PermitReviewBanner height={height} isReviewComplete={true} isExtracted={true} />
      <p>AI: requires review</p>
      <PermitReviewBanner height={height} isReviewComplete={false} isExtracted={true} />
      <p>Drafted in core, cannot be modified</p>
      <PermitReviewBanner height={height} isReviewComplete={true} isExtracted={false} />
    </ReduxWrapper>
  );

  expect(container).toMatchSnapshot();
});
