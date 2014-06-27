'use strict';

angular.module('jqplay.services', []).factory('jqplayService', function ($http) {
  return {
    run: function (jq) {
      return $http({
        method: "post",
        url: "/jq",
        data: {
          j: jq.j,
          q: jq.q,
          o: jq.o
        }
      });
    }
  };
});
