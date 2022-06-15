# Core MDS Test Strategy

# This strategy is also contained in the General Team Resources in the Mines Digital Services confluence page.

## Server-side

Purpose: Ensure the stability and consistency of class methods (and perhaps model-level validation).

Test public methods

- Happy, sad, edge cases
- Highly-aggressive coverage
- A great place for generative / random tests

## API Testing

Purpose: Ensure that the API accepts/rejects and returns the expected data.

Test public endpoints

- Happy path + validation tests
- Validation tests are a good place to generate random input data
- Test that error responses are all wrapped (not passed directly to end user)

## Load Testing

Purpose: Ensure that the API does not break under heavy loads.

This is not run in the pipeline and relies on being run before major releases. The tests are located in the load_testing directory at the root of the project and use the python Locust library.

## Client-side

### Linting and Git Hooks

Purpose: Insure best practices are followed. Proptypes are defined and unused variables and methods are cleaned up.

Current git hooks prevent commits and pull requests that have linting errors. If a user needs to override this behaviour they can add the command `--no-verify`.

### Unit Testing

Purpose: Ensure that pure functions manipulate data as-expected, that method calls trigger the expected events/actions, etc.

Test public methods / exported functions

- Happy, sad, edge cases
- Highly-aggressive coverage

### Component Testing

Purpose: Ensure that components render as-expected, given the mock data.

### Snapshot tests

Integration Testing
Purpose: Ensure that units work together as-expected.

Unsure of current state of / feasibility for integration testing client. Perhaps unnecessary.

## Functional Testing

Purpose: Automate UI testing of core features, ensuring that the end user’s experience is acceptable.

Test UI Behaviour

- Happy path
- Only the most common / business-critical use cases
  - Ex. Test that key form submissions remain successful
  - Upload download functionality.
- Test features and behaviour (not logic and layout)
- Make tests as agnostic to the DOM structure as possible
- Delays should depend on an event (ie. DOM loaded, response returned) and not on a hardcoded timeout

“It will enable you to do frequent deploys, because even if you introduce small bugs (that might pass through manual regression testing anyway) you will have confidence that the core functionality is still working … You shouldn't write UI-tests for everything.
Instead, think of UI-tests as a sanity test for your solution - a health check for your core functionality.” - Why You Should UI Test https://blog.novanet.no/why-you-should-ui-test/

## Further Reading:

Top 15 UI Test Automation Best Practices You Should Follow https://www.blazemeter.com/blog/top-15-ui-test-automation-best-practices-you-should-follow

## Permissions Testing

Purpose: Insure that different roles cannot access/alter data they should not be able to see.

There is a test plan in the docs folder of the project `docs/core_test_plan_TEMPLATE.xlsx`. This contains a permissions matrix of user stories and roles as of July 2019. It is recommended that this be run through and updated before major releases.
