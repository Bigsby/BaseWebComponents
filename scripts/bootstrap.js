"use strict";
(function () {
    SystemJS.config({
        "baseURL": "/scripts",
        "map": {
            "json": "https://cdnjs.cloudflare.com/ajax/libs/systemjs-plugin-json/0.3.0/json.min.js",
            "base": "../base"
        },
        "meta": {
            "*.json": {
                "loader": "json"
            }
        },
        "paths": {
            "data": "../../../data"
        }
    });

    SystemJS.registerDynamic("bootstrap", [
        "base/scripts/config.json",
        "config.json"
    ], true, function (require, exports, module) {
        const coreConfig = require("base/scripts/config.json");
        const appConfig = require("config.json");

        if (appConfig.styles)
            appConfig.styles.forEach(function (css) {
                var styleToLoad = css;
                if (coreConfig.styles[css])
                    styleToLoad = coreConfig.styles[css];
                SystemJS.import(styleToLoad);
            });

        var appBuilderDeps = coreConfig.config.meta.appBuilder.deps;

        if (appConfig.useRouting) {
            appBuilderDeps.push("angular-ui-router");
            coreConfig.angular.modules.push("ui.router");
            coreConfig.angular.configComponents.push("$stateProvider");
            coreConfig.angular.configComponents.push("$urlRouterProvider");
            coreConfig.angular.configComponents.push("metadataProvider");
        }

        if (appConfig.ga)
            appBuilderDeps.push("ga");

        if (appConfig.appBuilderDeps && appConfig.appBuilderDeps.length)
            appBuilderDeps = appBuilderDeps.concat(appConfig.appBuilderDeps);

        coreConfig.config.meta.appBuilder.deps = appBuilderDeps;

        if (appConfig.angular && appConfig.angular.modules && appConfig.angular.modules.length)
            coreConfig.angular.modules = coreConfig.angular.modules.concat(appConfig.angular.modules);

        const builderInvokerDeps = coreConfig.builderInvokerDeps;
        if (appConfig.initialData)
            appConfig.initialData.forEach(function (file) {
                const map = "data-" + file;
                coreConfig.config.map[map] = "data/" + file + ".json";
                builderInvokerDeps.push(map);
            });

        SystemJS.config(coreConfig.config);
        if (appConfig.config)
            SystemJS.config(appConfig.config);

        SystemJS.registerDynamic("builderInvoker", builderInvokerDeps, true, function (require, exports, module) {
            const data = {};

            if (appConfig.initialData && appConfig.initialData.length) {
                appConfig.initialData.forEach(function (file) {
                    var content = require("data-" + file);
                    data[file] = content;
                });
            }

            SystemJS.import("appBuilder").then(function (appBuilder) {

                const app = angular.module(coreConfig.angularAppName, coreConfig.angular.modules);

                const RegisterBaseComponents = require("baseAppComponents");
                RegisterBaseComponents(app);
                app.value("data", data);

                if (appConfig.ga)
                    app.run(function ($window, $transitions, $location) {
                        $window.ga("create", appConfig.ga, "auto");
                        $transitions.onSuccess({}, () => {
                            $window.ga("send", "pageview", $location.path());
                        });
                    });

                window.templatePath = function (name) {
                    return "templates/" + name + ".html";
                };

                if (appBuilder.RegisterComponents && typeof appBuilder.RegisterComponents === "function")
                    appBuilder.RegisterComponents(app, data);

                app.config(coreConfig.angular.configComponents.concat([function ($httpProvider, $sceProvider, $stateProvider, $urlRouterProvider, metadata) {
                    $httpProvider.defaults.useXDomain = true;
                    $sceProvider.enabled(false);

                    if ($stateProvider &&
                        appBuilder.RegisterStates && typeof appBuilder.RegisterStates === "function")
                        appBuilder.RegisterStates($stateProvider, data);

                    if ($urlRouterProvider)
                        $urlRouterProvider.otherwise("/");

                    

                    if (metadata){
                        angular.extend(coreConfig.metadata, appConfig.metadata || {});
                        angular.extend(metadata, coreConfig.metadata);
                    }
                }]));

                angular.bootstrap(document, [coreConfig.angularAppName]);
            });
        });

        SystemJS.import("builderInvoker");
    });

    SystemJS.import("bootstrap");
})();