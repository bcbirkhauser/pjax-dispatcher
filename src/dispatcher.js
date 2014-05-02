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
        if (requires) this._required = requies;

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
    _handleRoute: function(url) {
        var $this = this;
        var l = $this.getLocation(url);

        if ($this._routes.hasOwnProperty(l.pathname)) {
            //if $this exact route is already set.
            if ($this._required.hasOwnProperty(l.pathname)) {
                toast($this._required[l.pathname][0], function() {
                    if ($this._required[l.pathname][1]) {
                        $this._required[l.pathname][1]();
                    }
                    $this._routes[l.pathname]();
                })
            } else {
                $this._routes[l.pathname]();
            }

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
            } else {
                path = '/';
            }

            if (urlparts.length >= 2) {
                if (urlparts[2] !== "") {
                    path = '/' + urlparts[1] + '/' + urlparts[2] + '/';
                    action = urlparts[2];
                }
            }
            //check if our route definitions has a method for this path.
            if ($this._routes.hasOwnProperty(path)) {
                if ($this._required.hasOwnProperty(path)) {
                    toast($this._required[path][0], function() {
                        if ($this._required[path][1]) {
                            $this._required[path][1]();
                        }
                        $this._routes[path]();
                    })
                } else {
                    $this._routes[path]();
                }
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
    },
});