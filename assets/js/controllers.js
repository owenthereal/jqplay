angular.module('jqplay.controllers', []).controller('JqplayCtrl', function JqplayCtrl($scope, $timeout, $window, jqplayService) {
  $scope.jq = {};
  $scope.jq.o = [
    { name: "slurp", enabled: false },
    { name: "null-input", enabled: false },
    { name: "compact-output", enabled: false },
    { name: "raw-input", enabled: false },
    { name: "raw-output", enabled: false },
    { name: "sort-keys", enabled: false },
  ];
  $scope.cmd = "jq ''";
  $scope.result = "";

  $scope.jsonEditorLoaded = function(_editor) {
    _editor.$blockScrolling = Infinity
    _editor.setHighlightActiveLine(false);
    _editor.setFontSize(14);
    _editor.setShowPrintMargin(false);
    _editor.session.setUseWorker(false);
  };

  $scope.queryEditorLoaded = function(_editor) {
    _editor.$blockScrolling = Infinity
    _editor.setHighlightActiveLine(false);
    _editor.setFontSize(14);
    _editor.setShowPrintMargin(false);
    _editor.session.setUseWorker(false);
    _editor.focus()
  };

  $scope.buildCmd = function(jq) {
    var cmd = 'jq '
    jq.o.forEach(function(o) {
      if (o.enabled) {
        cmd += '--' + o.name + ' '
      }
    })
    var q = jq.q || ''

    return cmd + "'" + q.replace(/'/g, "'\\''") + "'" // use POSIX shell's strong quoting rules
  }

  $scope.$watch('jq', function(newValue, oldValue) {
    if ( newValue !== oldValue ) {
      $scope.cmd = $scope.buildCmd($scope.jq)
      $scope.delayedRun($scope.jq)
    }
  }, true);

  $scope.shareSnippet = function() {
    jqplayService.share($scope.jq).then(
      function successCallback(response) {
        $window.location.href = '/s/' + response.data;
      },
      function errorCallback(response) {
        $scope.result = response.data;
      });
  };

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

    jqplayService.run(jq).then(function successCallback(response) {
      $scope.result = response.data;
    }, function errorCallback(response) {
      $scope.result = response.data;
    });
  };

  $scope.samplesLeft = [
    {
      text: "unchanged input",
      code: ".",
      input_q: ".",
      input_j: '{ "foo": { "bar": { "baz": 123 } } }'
    },
    {
      text: "value at key",
      code: ".foo, .foo.bar, .foo?",
      input_q: ".foo",
      input_j: '{"foo": 42, "bar": "less interesting data"}'
    },
    {
      text: "array operation",
      code: ".[], .[]?, .[2], .[10:15]",
      input_q: ".[1]",
      input_j: '[{"name":"JSON", "good":true}, {"name":"XML", "good":false}]'
    },
    {
      text: "array/object construction",
      code: "[], {}",
      input_q: "{user, title: .titles[]}",
      input_j: '{"user":"jqlang","titles":["JQ Primer", "More JQ"]}'
    },
    {
      text: "length of a value",
      code: "length",
      input_q: ".[] | length",
      input_j: '[[1,2], "string", {"a":2}, null]'
    },
    {
      text: "keys in an array",
      code: "keys",
      input_q: "keys",
      input_j: '{"abc": 1, "abcd": 2, "Foo": 3}'
    }
  ];

  $scope.samplesRight = [
    {
      text: "feed input into multiple filters",
      code: ",",
      input_q: ".foo, .bar",
      input_j: '{ "foo": 42, "bar": "something else", "baz": true}'
    },
    {
      text: "pipe output of one filter to the next filter",
      code: "|",
      input_q: ".[] | .name",
      input_j: '[{"name":"JSON", "good":true}, {"name":"XML", "good":false}]'
    },
    {
      text: "input unchanged if foo returns true",
      code: "select(foo)",
      input_q: "map(select(. >= 2))",
      input_j: '[1,5,3,0,7]'
    },
    {
      text: "invoke filter foo for each input",
      code: "map(foo)",
      input_q: "map(.+1)",
      input_j: '[1,2,3]'
    },
    {
      text: "conditionals",
      code: "if-then-else-end",
      input_q: 'if . == 0 then "zero" elif . == 1 then "one" else "many" end',
      input_j: '2'
    },
    {
      text: "string interpolation",
      code: "\\(foo)",
      input_q: '"The input was \\(.), which is one less than \\(.+1)"',
      input_j: '42'
    }
  ];

  $scope.loadSample = function(samples, index) {
    $scope.jq.j = samples[index].input_j;
    $scope.jq.q = samples[index].input_q;
    $scope.input.$valid = true;
  };

  if (window.jq != null) {
    $scope.jq.j = window.jq.j;
    $scope.jq.q = window.jq.q;
    if (!!window.jq.o) {
      $scope.jq.o = window.jq.o;
    }
    $scope.cmd = $scope.buildCmd($scope.jq);
    $scope.run($scope.jq);
  }
});
