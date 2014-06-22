'use strict';

angular.module('jqplay.controllers', []).controller('JqplayCtrl', function JqplayCtrl($scope, $timeout, jqplayService) {
  $scope.result = "";

  $scope.editorLoaded = function(_editor) {
    _editor.setHighlightActiveLine(false);
    _editor.setFontSize(14);
  };

  $scope.$watch('jq', function(newValue, oldValue) {
    if ($scope.input.$valid) {
      if ($scope.runTimeout != null) {
        $timeout.cancel($scope.runTimeout);
        $scope.runTimeout = null;
      }

      $scope.runTimeout = $timeout(function() {
        $scope.run($scope.jq);
        $scope.runTimeout = null;
      }, 1000);
    } else {
      $scope.result = "";
    }
  }, true);

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
});
