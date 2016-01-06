'use strict';

(function (angular, appConfig) {

  angular
    .module('testsCucumberApp', [
      'ngAnimate',
      'ngCookies',
      'ngResource',
      'ngRoute',
      'ngSanitize',
      'ngTouch'
    ])
    .constant('baseUri', appConfig.apiBaseUri)
    .config(function ($routeProvider) {
      $routeProvider
        .otherwise({
          redirectTo: '/'
        });
    });

})(angular, configuration);
