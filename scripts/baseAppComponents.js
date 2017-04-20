module.exports = function (app) {
    app.directive("url", function () {
        return {
            restrict: "E",
            link: function link(scope, element, attrs) {
                var link = attrs.href || attrs.link;
                element[0].outerHTML = "<a target='_blank' href='" + link + "'>" + (attrs.text || element.html() || link) + "</a>";
            }
        };
    });

    app.directive('bindHtmlCompile', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(function () {
                    return scope.$eval(attrs.bindHtmlCompile);
                }, function (value) {
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

    app.directive("codeHighlight", ["$http", "$compile", function ($http, $compile) {
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
                    if (!attrs.code)
                        $scope.$watch(
                            function (scope) {
                                return scope.$eval(attrs.compile);
                            },
                            function (value) {
                                element.html(value);
                                $compile(element.contents())($scope);
                            }
                        );
                    code.textContent = attrs.code || element.text();
                    hljs.highlightBlock(code);
                    element.html(pre.outerHTML);
                }
            }
        }
    }]);

    app.directive("output", ["$compile", function ($compile) {
        return {
            restrict: "E",
            link: function ($scope, element, attrs) {
                $scope.$watch(
                    function (scope) {
                        return scope.$eval(attrs.compile);
                    },
                    function (value) {
                        element.html(value);
                        $compile(element.contents())($scope);
                    }
                );
                var pre = document.createElement("pre");
                pre.className = "output";
                var code = document.createElement("code");
                code.textContent = element.text();
                pre.appendChild(code);
                element.html(pre.outerHTML);
            }
        }
    }]);

    app.factory("baseHelper", [function () {
        function templatePath(path) {
            return "templates/" + path + ".html";
        }
    }]);

    function metaProvider($document, options) {
        const headElement = $document.find("head");
        const head = headElement[0];
        this.titlePrefix = options.titlePrefix;
        this.titleSufix = options.titleSufix || "Bigsby";
        this.titleSeperator = options.titleSeperator || " | ";

        function setMeta(name, value) {
            var find = head.querySelectorAll("meta[name=" + name + "]");
            var element = find.length ? find[0] : document.createElement("meta");
            if (!find.length)
                head.appendChild(element);
            
            element.name = name;
            element.content = value;
        };

        function setTitle(value) {
            var titleElement = headElement.find("title");
            if (!titleElement) {
                titleElement = angular.element("<title/>");
                head.appendChild(titleElement);
            }
            titleElement.text(value);
        }

        this.set = function (meta) {
            if (!meta) return;

            if (meta.title)
                setTitle([this.titlePrefix, meta.title, this.titleSufix].join(this.titleSeperator));
            else
                setTitle([this.titlePrefix, this.titleSufix].join(this.titleSeperator));

            for (var property in meta) {
                if (property != "title")
                    setMeta(property, meta[property]);
            }
        };
    }

    app.provider("metadata", function () {
        var me = this;

        this.$get = ["$document", function ($document) {
            var provider = new metaProvider($document, me);
            if (me.properties)
                provider.set(me.properties);
            return provider;
        }];
    });
};