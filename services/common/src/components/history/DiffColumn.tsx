import React from "react";
import { Typography } from "antd";

export interface IDiffColumn {
  fieldName: string;
  previousValue: any;
  currentValue: any;
}

export interface DiffColumnProps {
  differences: IDiffColumn[];
}

const DiffColumn: React.FC<DiffColumnProps> = ({ differences }) => {
  const valueOrNoData = (value: any) => {
    if (typeof value === "boolean") {
      return value ? "True" : "False";
    }
    return value ? value : "No Data";
  };

  return (
    <div className="padding-md--top">
      {differences.map((diff) => (
        <div key={diff.fieldName}>
          {diff.fieldName === "Documents" ? (
            <div>
              <Typography.Paragraph strong className="margin-none line-height-none">
                Files Added:
              </Typography.Paragraph>
              {diff.currentValue.map((file: any, index) => (
                <Typography.Paragraph
                  key={`${file}${index}`}
                  className="green margin-none line-height-none"
                >
                  {file}
                </Typography.Paragraph>
              ))}
            </div>
          ) : (
            <div>
              <Typography.Paragraph strong className="margin-none line-height-none">
                {diff.fieldName}:
              </Typography.Paragraph>
              {diff.fieldName !== "None" && (
                <Typography.Paragraph>
                  <Typography.Text className="red">
                    {valueOrNoData(diff.previousValue)}
                  </Typography.Text>
                  {` => `}
                  <Typography.Text className="green">
                    {valueOrNoData(diff.currentValue)}
                  </Typography.Text>
                </Typography.Paragraph>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DiffColumn;
