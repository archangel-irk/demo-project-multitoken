import { configureScope, init } from '@sentry/browser';


const HASH_LENGTH = 8;
// We use Heroku's SOURCE_VERSION (set in .env)
// see https://devcenter.heroku.com/changelog-items/630
const GIT_HASH_SHORT = (process.env.REACT_APP_GIT_HASH || '').slice(0, HASH_LENGTH);
const SENTRY_CONFIG = {
  release: process.env.REACT_APP_VERSION,
  environment: process.env.REACT_APP_ENV,
};

// https://docs.sentry.io/quickstart/?platform=browsernpm#configure-the-sdk
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
  init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    ...SENTRY_CONFIG,
  });

  // https://docs.sentry.io/learn/scopes/?platform=browsernpm
  configureScope(scope => {
    scope.setTag('git_commit', GIT_HASH_SHORT);
  });
}
