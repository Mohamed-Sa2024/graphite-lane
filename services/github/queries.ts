export const PR_FIELDS = /* GraphQL */ `
  fragment PRFields on PullRequest {
    id
    number
    title
    state
    isDraft
    url
    createdAt
    updatedAt
    additions
    deletions
    changedFiles
    reviewDecision
    mergeable
    author {
      login
      avatarUrl
      ... on User { name }
    }
    baseRefName
    headRefName
    repository {
      name
      nameWithOwner
      owner { login }
    }
    labels(first: 10) {
      nodes { name color }
    }
    comments { totalCount }
    reviews(first: 50) {
      nodes {
        state
        author { login avatarUrl ... on User { name } }
      }
    }
    reviewRequests(first: 20) {
      nodes {
        requestedReviewer {
          __typename
          ... on User { login avatarUrl name }
          ... on Team { name }
        }
      }
    }
    commits(last: 1) {
      nodes {
        commit {
          statusCheckRollup { state }
        }
      }
    }
  }
`;

export const SEARCH_PRS = /* GraphQL */ `
  ${PR_FIELDS}
  query SearchPRs($q: String!, $cursor: String) {
    search(query: $q, type: ISSUE, first: 50, after: $cursor) {
      issueCount
      pageInfo { hasNextPage endCursor }
      nodes {
        __typename
        ... on PullRequest { ...PRFields }
      }
    }
  }
`;

export const VIEWER = /* GraphQL */ `
  query Viewer {
    viewer { login name avatarUrl }
  }
`;

export const REPOS = /* GraphQL */ `
  query Repos($cursor: String) {
    viewer {
      repositories(
        first: 50
        after: $cursor
        orderBy: { field: PUSHED_AT, direction: DESC }
        affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
      ) {
        pageInfo { hasNextPage endCursor }
        nodes { nameWithOwner owner { login } name isPrivate }
      }
    }
  }
`;

export const PR_DETAIL = /* GraphQL */ `
  ${PR_FIELDS}
  query PRDetail($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        ...PRFields
        body
        bodyHTML
        comments(first: 50) {
          nodes {
            id
            body
            createdAt
            author { login avatarUrl ... on User { name } }
          }
        }
        commits(last: 1) {
          nodes {
            commit {
              statusCheckRollup {
                state
                contexts(first: 30) {
                  nodes {
                    __typename
                    ... on CheckRun { name conclusion detailsUrl }
                    ... on StatusContext { context state targetUrl }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
