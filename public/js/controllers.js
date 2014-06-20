'use strict';

angular.module('jqplay.controllers', []).controller('JqplayCtrl', function JqplayCtrl($scope, jqplayService) {
  $scope.result = "";
  $scope.run = function(jq) {
    $scope.result = "";

    var promise = jqplayService.run(jq);
    promise.success(function(data) {
      $scope.result = data.result;
    });
    promise.error(function(data) {
      $scope.result = data.message;
    });
  };
});
