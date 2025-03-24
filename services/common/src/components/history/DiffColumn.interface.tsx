export interface IDiffColumn {
  field_name: string;
  from: any;
  to: any;
}

export interface IDiffEntry {
  updated_by: string;
  updated_at: string;
  changeset: IDiffColumn[];
}

/**
 * Used to map the diff titles and values to a more user-friendly format
 * Supply *one of* hash, tranform, data
 *
 * Example structure:
 * {
 *   storage_location: {
 *     title: "Storage Location"
 *     data: [
 *        { value: "above_ground", label: "Above Ground" },
 *        { value: "below_ground", label: "Underground" }
 *     ]
 *     hash: { 
 *        above_ground: "Above Ground"
 *        below_ground: "Underground"
 *     }
 *     transform: (value) => formatDate(value)
 *   },
 * }
 */
export interface DiffColumnValueMapper {
  [key: string]: {
    title?: string;
    data?: { value: string; label: string }[];
    hash?: { [key: string]: string };
    transform?: (original: string) => string;
  };
}

export interface DiffColumnProps {
  differences: IDiffColumn[];
  valueMapper?: DiffColumnValueMapper;
}
