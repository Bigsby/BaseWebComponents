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
};
