angular.module('jqplay.services', []).factory('jqplayService', function ($http) {
  return {
    share: function (jq) {
      return $http({
        method: "post",
        url: "/s",
        data: {
          j: jq.j,
          q: jq.q,
          o: jq.o
        }
      });
    },
    run: function (jq) {
      return $http({
        method: "post",
        url: "/jq",
        transformResponse: function(value) {
          return value;
        },
        data: {
          j: jq.j,
          q: jq.q,
          o: jq.o
        }
      });
    }
  };
});
