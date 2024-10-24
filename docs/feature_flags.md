# Feature Flags

MDS Supports feature flags both for our frontend and backend apps using [Flagsmith](https://docs.flagsmith.com).

## Frontend

A couple of options exists to check for a feature flag in core-web and minespace-web.

### Defining feature flag

Feature flags for use in core / minespace have to be defined in the `Feature` enum located in `featureFlag.ts` in the common package.
The values of this enum, must match the name of a feature flag defined in Flagsmith.

```typescript
export enum Feature {
  MAJOR_PROJECT_ARCHIVE_FILE = "major_project_archive_file",
  DOCUMENTS_REPLACE_FILE = "major_project_replace_file",
  MAJOR_PROJECT_ALL_DOCUMENTS = "major_project_all_documents",
  MAJOR_PROJECT_DECISION_PACKAGE = "major_project_decision_package",
  FLAGSMITH = "flagsmith",
  TSF_V2 = "tsf_v2",
}
```

### Using `useFeatureFlag` hook

Preferred method if using feature flag in a functional React component.

```typescript
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";;

const ThisIsAReactComponent = () => {
  const { isFeatureEnabled } = useFeatureFlag();

  return (
    {isFeatureEnabled(Feature.TSF_V2)? <p>SuperSecretFeature</p>: <p>Sorry, you can't access this</p>}
  );
};
```

### Using `withFeatureFlag` HOC

Alternative method if using feature flag in a React component and you cannot use hooks (for example in class components).

```typescript
import withFeatureFlag from "@mds/common/providers/featureFlags/withFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";;

class ThisIsAReactComponent {
  render() {
    return (
      {props.isFeatureEnabled(Feature.TSF_V2)? <p>SuperSecretFeature</p>: <p>Sorry, you can't access this</p>}
    );
  }
};

export default withFeatureFlag(ThisIsAReactComponent);
```

### Using FeatureFlagGuard

Need to restrict a route based on a feature flag?

You can use the `FeatureFlagGuard` and pass along the feature you want to check for.
If it's not enabled, you get a nice little "you don't have access" notice.

```typescript
import { Feature } from "@mds/common/utils/featureFlag";
import FeatureFlagGuard from "@/components/common/featureFlag.guard";

const DamsPage: React.FC<DamsPageProps> = (props) => {
  return <div>ALL THE DAMS</div>;
};

const mapStateToProps = (state: RootState) => ({
  initialValues: getDam(state),
  tsf: getTsf(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    { createDam, updateDam, fetchMineRecordById, storeTsf, storeDam, submit },
    dispatch
  );

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  withRouter(FeatureFlagGuard(Feature.TSF_V2)(DamsPage))
);
```

### Using FeatureFlag directly (discouraged)

If you need access to a feature flag outside of a react context you can use `featureFlag.ts` directly.
Please use the other methods above as far as you can.

```typescript
import { isFeatureEnabled } from @mds/common;
import { Feature } from "@mds/common/utils/featureFlag";;

console.log(isFeatureEnabled(Feature.TSF_V2));

```

## Core API

How to use:

1. Define a feature flag in the `Feature` enum (feature_flag.py). The value of the enum must match a feature flag defined in Flagsmith.
2. You can use the `is_feature_enabled` function to check if the given flag is enabled.

```python
from app.api.utils.feature_flag import is_feature_enabled, Feature

if is_feature_enabled(Feature.TSF_V2):
    # Do something if TSF_V2 feature is enabled
```
