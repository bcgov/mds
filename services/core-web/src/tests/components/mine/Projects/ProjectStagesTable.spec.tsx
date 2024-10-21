import React from "react";
import { render } from "@testing-library/react";
import { ProjectStagesTable } from "@/components/mine/Projects/ProjectStagesTable";
import * as MOCK from "@/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const projectStages = [
  {
    title: "REQUIRED STAGES",
    key: "req-stages-id",
    status: "STATUS",
    isTitle: true,
  },
  {
    key: "ps-519",
    link: <div>link 1</div>,
    status: "DFT",
    statusHash: {
      WDN: "Withdrawn",
      UNR: "Under review",
      SUB: "Submitted",
      OHD: "On Hold",
      DFT: "Draft",
      COM: "Complete",
      CHR: "Change Requested",
      ASG: "Assigned",
    },
    title: "Project description",
  },
  {
    key: "ps-null",
    link: <div>link 2</div>,
    status: null,
    statusHash: {
      UNR: "Under review",
      SUB: "Submitted",
      DFT: "Draft",
      CHR: "Change Requested",
      APV: "Approved",
    },
    title: "Final Application",
  },
  {
    title: "OPTIONAL STAGES",
    key: "opt-stages-id",
    status: "STATUS",
    isOptional: true,
    isTitle: true,
  },
  {
    isOptional: true,
    key: "irt-0",
    link: <div>link 3</div>,
    status: null,
    statusHash: {
      UNR: "Under review",
      SUB: "Submitted",
      DFT: "Draft",
      CHR: "Change Requested",
      APV: "Approved",
    },
    title: "Final IRT",
  },
];

describe("ProjectStagesTable", () => {
  it("renders properly", () => {
    const { container } = render(<ProjectStagesTable projectStages={projectStages} />);
    expect(container).toMatchSnapshot();
  });
});
