/*global jqplay */
'use strict';

jqplay.factory('jqplayService', function ($http) {
  return {
    run: function (jq) {
      return $http({
        method: "post",
        url: "/jq",
        data: {
          j: jq.j,
          q: jq.q
        }
      });
    }
  };
});
