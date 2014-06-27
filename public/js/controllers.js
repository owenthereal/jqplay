'use strict';

angular.module('jqplay.controllers', []).controller('JqplayCtrl', function JqplayCtrl($scope, $timeout, jqplayService) {
  $scope.jq = {}
  $scope.jq.o = { "null-input": false, "slurp": false, "compact-output": false, "raw-input": false, "raw-output": false }
  $scope.result = "";
  $scope.jq = {};

  $scope.editorLoaded = function(_editor) {
    _editor.setHighlightActiveLine(false);
    _editor.setFontSize(14);
    _editor.setShowPrintMargin(false);
  };

  $scope.$watch('jq', function(newValue, oldValue) {
    $scope.delayedRun($scope.jq)
  }, true);

  $scope.$watch('jq.o', function(newValue, oldValue) {
    $scope.delayedRun($scope.jq)
  }, true);

  $scope.delayedRun = function(jq) {
    if ($scope.input.$valid) {
      if ($scope.runTimeout != null) {
        $timeout.cancel($scope.runTimeout);
        $scope.runTimeout = null;
      }

      $scope.runTimeout = $timeout(function() {
        $scope.run(jq);
        $scope.runTimeout = null;
      }, 1000);
    } else {
      $scope.result = "";
    }
  };

  $scope.run = function(jq) {
    $scope.result = "Loading...";

    var promise = jqplayService.run(jq);
    promise.success(function(data) {
      $scope.result = data.result;
    });
    promise.error(function(data) {
      $scope.result = data.message;
    });
  };

  $scope.loadSample = function() {
    $scope.jq.j = '{ "foo" : { "bar" : { "baz" : 123 } } }'
    $scope.jq.q = '.foo.bar'
    $scope.run($scope.jq)
  }
});
