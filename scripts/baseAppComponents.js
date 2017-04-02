module.exports = function(app) {
    app.directive("url", function() {
        return {
            restrict: "E",
            link: function link(scope, element, attrs) {
                element[0].outerHTML = "<a target='_blank' href='" + (attrs.href || attrs.link) + "'>" + (attrs.text || element.text() || attrs.link) + "</a>";
            }
        };
    });

    app.directive('bindHtmlCompile', ['$compile', function($compile) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                scope.$watch(function() {
                    return scope.$eval(attrs.bindHtmlCompile);
                }, function(value) {
                    element.html(value && value.toString());
                    var compileScope = scope;
                    if (attrs.bindHtmlScope) {
                        compileScope = scope.$eval(attrs.bindHtmlScope);
                    }
                    $compile(element.contents())(compileScope);
                });
            }
        };
    }]);

    app.directive("codeHighlight", function ($http) {
        return {
            restrict: "E",
            link: function ($scope, element, attrs) {
                var pre = document.createElement("pre");
                if (attrs.linenumbers && attrs.linenumbers != "false")
                    pre.className = "line-numbers";
                var code = document.createElement("code");
                code.className = attrs.hljs;
                pre.appendChild(code);

                if (attrs.src) {
                    element.html("<br/><img src=\"base/images/loading.gif\"/>");

                    $http.get(attrs.src)
                        .then(function (response) {
                            element.html("");
                            code.textContent = response.data;
                            try {
                                hljs.highlightBlock(code);
                            } catch (error) {
                                console.log(error);
                            }
                            element.html(pre.outerHTML);
                        });

                }
                else {
                    code.textContent = attrs.code || element.text();
                    hljs.highlightBlock(code);
                    element.html(pre.outerHTML);
                }
            }
        }
    });

    app.directive("output", function(){
        return {
            restrict: "E",
            link: function($scope, element, attrs){
                var pre = document.createElement("pre");
                pre.className = "output";
                var code = document.createElement("code");
                code.textContent = element.text();
                pre.appendChild(code);
                element.html(pre.outerHTML);
            }
        }
    });
};
