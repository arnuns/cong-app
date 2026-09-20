'use strict';

const path = require('path');
const url = require('url');

const DEV_SERVER_ENV = 'CONG_APP_DEV_SERVER_URL';
const DEV_SERVER_URL = 'http://127.0.0.1:4211/';

function getDevelopmentUrl(environment) {
  const configuredUrl = environment[DEV_SERVER_ENV];
  if (!configuredUrl) {
    return null;
  }
  if (configuredUrl !== DEV_SERVER_URL) {
    throw new Error(DEV_SERVER_ENV + ' must be ' + DEV_SERVER_URL);
  }
  return configuredUrl;
}

function isDevelopmentRenderer(environment) {
  return getDevelopmentUrl(environment || process.env) !== null;
}

function buildRendererUrl(route, environment, appRoot) {
  const activeEnvironment = environment || process.env;
  const developmentUrl = getDevelopmentUrl(activeEnvironment);
  const baseUrl = developmentUrl || url.pathToFileURL(
    path.join(appRoot || __dirname, 'dist', 'index.html')
  ).toString();
  if (!route) {
    return baseUrl;
  }
  const normalizedRoute = route.charAt(0) === '/' ? route : '/' + route;
  return baseUrl + '#' + normalizedRoute;
}

module.exports = {
  DEV_SERVER_ENV: DEV_SERVER_ENV,
  DEV_SERVER_URL: DEV_SERVER_URL,
  buildRendererUrl: buildRendererUrl,
  isDevelopmentRenderer: isDevelopmentRenderer
};
