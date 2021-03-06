(function (angular) {
  'use strict';

  var TestRunCoreService = function ($httpParamSerializer, TestRunResource, Upload, baseUri) {

    this.getLatests = function (withStats) {
      return TestRunResource.query({ withStats: withStats || false }).$promise;
    };

    this.getById = function (testRunId) {
      return TestRunResource.get({ testRunId: testRunId }).$promise;
    };

    this.findByType = function (type) {
      return TestRunResource.query({ type: type, withStats: true }).$promise;
    };

    this.create = function (testRun) {
      return TestRunResource.create(testRun).$promise;
    };

    this.importCucumberResults = function (testRunId, file, importOptions) {
      var queryParams = $httpParamSerializer(importOptions);
      var url = baseUri + '/testRuns/' + testRunId + '/import?' + queryParams;

      return Upload.http({
         url: url,
         headers : {
           'Content-Type': 'application/json'
         },
         data: file
       });
    };

    this.delete = function (testRunId) {
      return TestRunResource.delete({ testRunId: testRunId }).$promise;
    };

  };

  angular.module('testsCucumberApp')
    .controller('AllTestRunsCtrl', function (TestRunCoreService, $uibModal, $location) {

      this.load = function () {
        TestRunCoreService.getLatests(true)
          .then(function (latestTestRuns) {
            this.latestTestRuns = latestTestRuns;
          }.bind(this));
      };

      this.openCreateForm = function () {
        var createdModal = $uibModal.open({
          templateUrl: 'createTestRunForm.html',
          controller: 'CreateTestRunCtrl',
          controllerAs: 'createCtrl'
        });

        createdModal.result
          .then(function (testRun) {
            return TestRunCoreService.create(testRun);
          })
          .then(function (response) {
            $location.path('/test-runs/' + response.id);
          });
      };

      this.load();

    })
    .controller('TestRunCtrl', function ($q, $routeParams, $location, $uibModal, TestRunCoreService, FeatureCoreService, ScenarioCoreService, ErrorService, ConfirmationModalService, featureStoredFilters) {

      this.load = function () {

        TestRunCoreService.getById($routeParams.testRunId)
          .then(function (testRun) {

            var featuresQ = FeatureCoreService.getFeaturesByTestRunId(testRun.id);
            var statsQ = ScenarioCoreService.getStatsByTestRunId(testRun.id);
            var historyQ = TestRunCoreService.findByType(testRun.type);

            return $q.all([featuresQ, statsQ, historyQ])
              .then(_.spread(function (features, stats, history) {
                testRun.features = features;
                testRun.stats = stats;
                testRun.history = history;
                return testRun;
              }));

          })
          .then(function (testRun) {
            this.testRun = testRun;

            // TODO Not clean...
            this.history = testRun.history;
            delete testRun.history;
          }.bind(this));
      };

      this.delete = function () {

        return ConfirmationModalService
          .open({
            title: 'Supprimer le tir de tests',
            bodyContent: 'La suppression est irreversible. Êtes-vous sûr de supprimer ce tir ?',
            confirmTitle: 'Supprimer'
          })
          .then(function () {
            return TestRunCoreService.delete(this.testRun.id);
          }.bind(this))
          .then(function () {
            $location.path('/');
          });

      };


      // Import

      this.openImportForm = function () {
        var createdModal = $uibModal.open({
          templateUrl: 'importCucumberResults.html',
          controller: 'ImportCucumberResultsCtrl',
          controllerAs: 'importCtrl'
        });

        createdModal.result
          .then(function (content) {
            // TODO Manage errors with Cucumber form validation
            if (content.file === null || angular.isUndefined(content.file)) {
              return $q.reject('Fichier de rapport Cucumber non défini');
            }

            return TestRunCoreService.importCucumberResults(this.testRun.id, content.file, content.importOptions);
          }.bind(this))
          .then(function () {
            this.load();
          }.bind(this))
          .catch(function (error) {
            ErrorService.sendError(error);
          });

      };


      // Filter

      this.filters = featureStoredFilters.get();

      this.updateStoredFilters = function () {
        featureStoredFilters.save(this.filters);
      }.bind(this);

      this.isFeatureDisplayable = function (feature) {
        switch (feature.status) {
          case 'PASSED':
            return this.filters.passed;
          case 'FAILED':
            return this.filters.failed;
          case 'PARTIAL':
            return this.filters.partial;
          case 'NOT_RUN':
            return this.filters.notRun;
          default:
            return true;
        }
      }.bind(this);


      // Tags

      this.viewTags = function () {
        $location.path('/test-runs/' + $routeParams.testRunId + '/tags');
      };


      this.load();

    })
    .controller('TestRunTagsCtrl', function ($routeParams, $q, TestRunCoreService, ScenarioCoreService) {

      this.load = function () {

        var testRunQ = TestRunCoreService.getById($routeParams.testRunId);
        var tagsQ = ScenarioCoreService.getTagsByTestRunId($routeParams.testRunId);

        return $q.all([testRunQ, tagsQ])
          .then(_.spread(function (testRun, tags) {
            testRun.tags = tags;
            return testRun;
          }))
          .then(function (testRun) {
            this.testRun = testRun;
          }.bind(this));
      };


      // Filter tags

      this.filteredTags = '';

      this.clearTagsFilter = function () {
        this.filteredTags = '';
      };

      this.isAcceptedTag = function (tag) {
        if (this.filteredTags.length > 0) {
          return _.isString(tag.tag) && tag.tag.startsWith(this.filteredTags);
        }
        return true;
      }.bind(this);


      this.load();

    })
    .controller('TestRunTagCtrl', function ($q, $routeParams, TestRunCoreService, FeatureCoreService, ScenarioCoreService) {

      this.tag = $routeParams.tag;

      this.load = function () {

        var testRunQ = TestRunCoreService.getById($routeParams.testRunId);
        var scenariiQ = ScenarioCoreService.getScenariiByTestRunIdAndTag($routeParams.testRunId, $routeParams.tag);
        var featuresQ = FeatureCoreService.getFeaturesByTestRunIdAndTag($routeParams.testRunId, $routeParams.tag);
        var statsQ = ScenarioCoreService.getStatsByTestRunIdAndTag($routeParams.testRunId, $routeParams.tag);

        return $q.all([testRunQ, scenariiQ, featuresQ, statsQ])
          .then(_.spread(function (testRun, scenarii, features, stats) {

            // Attach features to scenarii

            var featuresById = {};
            features.forEach(function (feature) {
              featuresById[feature.id] = feature;
            });

            scenarii.forEach(function (scenario) {
              scenario.feature = featuresById[scenario.featureId];
            });

            // Sort scenarii by feature name, then scenario name

            scenarii.sort(function (left, right) {
              var featureNameComparison = left.feature.info.name.localeCompare(right.feature.info.name);
              if (featureNameComparison === 0) {
                return left.info.name.localeCompare(right.info.name);
              }
              return featureNameComparison;
            });

            this.testRun = testRun;
            this.scenarii = scenarii;
            this.features = features;
            this.stats = stats;
          }.bind(this)));
      };


      this.selectedFeatureId = null;

      this.selectFeatureId = function (featureId) {
        this.selectedFeatureId = featureId;
      }.bind(this);

      this.clearSelectedFeatureIds = function () {
        this.selectedFeatureId = null;
      }.bind(this);

      this.isFeatureDisplayable = function (feature) {
        if (this.selectedFeatureId === null) {
          return true;
        }
        return this.selectedFeatureId === feature.id;
      }.bind(this);

      this.isScenarioDisplayable = function (scenario) {
        if (this.selectedFeatureId === null) {
          return true;
        }
        return this.selectedFeatureId === scenario.featureId;
      }.bind(this);


      this.load();

    })
    .controller('CreateTestRunCtrl', function ($uibModalInstance) {

      this.testRun = {
        type: ''
      };

      this.create = function () {
        $uibModalInstance.close(this.testRun);
      };

    })
    .controller('ImportCucumberResultsCtrl', function ($uibModalInstance) {

      this.file = null;
      this.importOptions = {
        group: null,
        dryRun: false,
        onlyNewScenarii: true
      };

      this.import = function () {
        $uibModalInstance.close({
          file: this.file,
          importOptions: this.importOptions
        });
      };

    })
    .factory('featureStoredFilters', function (ObjectBrowserStorage) {
      return ObjectBrowserStorage.getItem('featureFilters', function () {
        return {
          passed: true,
          failed: true,
          partial: true,
          notRun: true
        };
      });
    })
    .service('TestRunCoreService', TestRunCoreService)
    .service('TestRunResource', function ($resource, baseUri) {
      return $resource(
        baseUri + '/testRuns/:testRunId',
        { testRunId: '@id' },
        {
          create: {
            method: 'POST',
            url: baseUri + '/testRuns/create'
          }
        }
      );
    })
    .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/test-runs.html',
          controller: 'AllTestRunsCtrl',
          controllerAs: 'ctrl'
        })
        .when('/test-runs/:testRunId', {
          templateUrl: 'views/test-run.html',
          controller: 'TestRunCtrl',
          controllerAs: 'ctrl'
        })
        .when('/test-runs/:testRunId/tags', {
          templateUrl: 'views/test-run-tags.html',
          controller: 'TestRunTagsCtrl',
          controllerAs: 'ctrl'
        })
        .when('/test-runs/:testRunId/tags/:tag', {
          templateUrl: 'views/test-run-tag.html',
          controller: 'TestRunTagCtrl',
          controllerAs: 'ctrl'
        });
    });

})(angular);
