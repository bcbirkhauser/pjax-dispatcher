/**
 * Class that handles calling functions based on the url.
 * Can load js or css before calling
 *
 * dependencies:
 *      jquery-pjax.js from
 *      class.js from http://ejohn.org/blog/simple-javascript-inheritance/
 *      toast.js from https://github.com/pyrsmk/toast
 *
 *
 *  @param object routes  should be an object with url paths as the keys and functions as the value
 *  routes = {
 *       '/': function() {},
 *      '/something/': MyClass.doSomethingCool
 *  };
 */

"use strict";
var Dispatcher = Class.extend({
    _routes: {},
    _required: {},
    init: function(routes, requires) {

        if (routes) this._routes = routes;
        if (requires) this._required = requires;

        var $this = this;
        $(document).on('pjax:end', function(e, xhr, options) {
            $this._handleRoute(options.url);
        });
        //call the function on init for initial page load.
        this._handleRoute(window.location);
    },
    route: function(path, controller, action) {
        this._routes[path] = function() {
            var c = new controller;
            controller[action]();
        }
    },
    before: function(path, required, callback) {
        this._required[path] = [required, callback];
    },
    getLocation: function(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    },
    isFunction: function(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    },
    _handleRoute: function(url) {
        var $this = this;
        var l = $this.getLocation(url);

        if ($this._routes.hasOwnProperty(l.pathname)) {
            //if $this exact route is already set.
            this._dispatchPath(l.pathname);

        } else {
            var urlparts;
            var controller;
            var action;
            var path;
            if (l.pathname.indexOf('/') != -1) {
                urlparts = l.pathname.split('/');
                if (urlparts[0] === "") {
                    path = '/' + urlparts[1] + '/';
                    controller = window[urlparts[1]];
                } else {
                    path = '/' + urlparts[0] + '/';
                    controller = window[urlparts[0]];
                }
                if (urlparts.length >= 2 && urlparts[2] !== "") {
                    path = '/' + urlparts[1] + '/' + urlparts[2] + '/';
                    action = urlparts[2];
                }
            } else {
                path = '/';
            }


            //check if our route definitions has a method for this path.
            if ($this._routes.hasOwnProperty(path)) {
                this._dispatchPath(path);
            } else {
                //check if we have a wildcard route defined
                path = '/' + urlparts[1] + '/*';
                if ($this._routes.hasOwnProperty(path)) {
                    this._dispatchPath(path);
                } else {
                    //see if we can find an object and method based on the parsed url
                    if (controller && typeof controller != "undefined") {
                        var c = new controller;
                        if (action) {
                            c[action]();
                        }
                    }
                }
            }
        }
    },
    _dispatchPath: function(path) {
        var $this = this;
        var controller;
        var c;

        if ($this._required.hasOwnProperty(path)) {
            $this._required[path][0].push(
                function() {
                    if ($this._required[path][1]) {
                        $this._required[path][1]();
                    }
                    if ($this.isFunction($this._routes[path])) {
                        $this._routes[path]();
                    } else if ($this._routes[path].controller != "undefined") {
                        controller = window[$this._routes[path].controller];
                        if (controller && typeof controller != "undefined") {
                            c = new controller;
                            if ($this._routes[path].action != "undefined") {
                                c[$this._routes[path].action]();
                            }
                        }
                    }

                }
            );
            toast.apply(null, $this._required[path][0]);
        } else {

            if ($this.isFunction($this._routes[path])) {
                $this._routes[path]();
            } else if ($this._routes[path].controller != "undefined") {
                controller = window[$this._routes[path].controller];
                if (controller && typeof controller != "undefined") {
                    c = new controller;
                    if ($this._routes[path].action != "undefined") {
                        c[$this._routes[path].action]();
                    }
                }
            }
        }
    }
});