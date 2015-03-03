angular.module('jqplay.filters', []).filter('capitalize', function() {
  return function(input, scope) {
    if (input == null) {
      return ''
    }

    input = input.toLowerCase();
    input = input.replace('-', ' ');

    var result = [];
    var str = input.split(' ');
    for (var i = 0; i < str.length; i++) {
      result.push(str[i].substring(0, 1).toUpperCase() + str[i].substring(1));
    }

    return result.join(' ');
  }
});
