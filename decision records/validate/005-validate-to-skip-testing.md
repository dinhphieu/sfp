# Trigger tests only for impacted packages during validate

* Status: Approved
* Deciders: @azlam-abdulsalam, @nbatterham, @Rocko1204
* Issue: #5

## Context and Problem Statement

In the context of validating a change in CI/review orgs, sfp currently triggers all Apex tests for changed packages. However, these changes might not always be directly introduced by a developer from a branch. They could also result from syncing an upstream change or the org being a few commits behind.

See the original issue  by @petter-eikeland

i.e. given that validate orgs were created at midnight, and 2 PRs have been merged to master/main changing package A and package B, respectively, both of which containing Apex classes and tests. When creating a 3rd PR, only changing package C (also with Apex classes and tests), validate would pick up changes in all 3 packages (A, B and C). In this scenario, validate deploys package A, and then executes the corresponding Apex tests. Then the same for package B and then finally package C. Ideally, validate would only deploy the (already validated) changes in package A and B (to update to validate org to what's on master/main), and only execute the Apex tests for package C.
E.g. if 'git diff HEAD origin/master --quiet ' + package["path"] + '/*' --> then run Apex tests. If not, skip Apex tests for the package.

This additional execution of Apex tests for already validated changes has an especially significant impact on our current cadence given Salesforce's infrastructure issues during release windows.

This model introduces considerable delay when PRs are synchronized in sfops style `Review` environments, as the 
environment has a life cycle till the PR is addressed

## Decision

After reviewing multiple orgs, we've determined there's no added value in triggering Apex tests for packages that are synchronized rather than directly impacted. The changes in such packages are minimal since the PR doesn't introduce any new modifications to the out-of-sync packages. Therefore, it's more efficient to only trigger tests for the directly impacted packages.

Initially, we considered adding a new flag and specific mode for this feature. However, to simplify adoption and because we foresee no significant impacts, we've decided against introducing a new mode. Instead, we will add flags to capture the SHA ref of the head of the incoming branch and the SHA ref of the base branch. It's crucial to ensure these refs are accurate and do not reflect any temporary detached commit IDs created by CI/CD systems such as GitHub.

This also means the following changes to behavior of how validate works

- Differentiate between packages that need to be synchronized vs validated
- Allow validate to commit the changed packages in to the target org, reverting earlier change to disableArtifactUpdate
- Always validate impacted packages to ensure retries between runs are consistent and reduce confusions
- Only commit the packages to an org, if the test pass for validate packages, however commit packages to org immediately for packages that are to be synchronized, when the deployment is successful
- Package Diff comparison logic need to be updated to ensure, that if the commit id in the org is incorrect, assume the package is never built


