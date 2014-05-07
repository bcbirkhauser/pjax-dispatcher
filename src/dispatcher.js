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
            var c = new controller();
            controller[action]();
        };
    },
    before: function(path, opts) {
        this._required[path] = opts;
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
                        var c = new controller();
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
            var assetsLoaded = function() {
                if ($this.isFunction($this._routes[path])) {
                    $this._routes[path]();
                } else if ($this._routes[path].controller != "undefined") {
                    controller = window[$this._routes[path].controller];
                    if (controller && typeof controller != "undefined") {
                        c = new controller();
                        if ($this._routes[path].action != "undefined") {
                            c[$this._routes[path].action]();
                        }
                    }
                }

            };
            this._loadRequiredFiles($this._required[path], assetsLoaded);



        } else {

            if ($this.isFunction($this._routes[path])) {
                $this._routes[path]();
            } else if ($this._routes[path].controller != "undefined") {
                controller = window[$this._routes[path].controller];
                if (controller && typeof controller != "undefined") {
                    c = new controller();
                    if ($this._routes[path].action != "undefined") {
                        c[$this._routes[path].action]();
                    }
                }
            }
        }
    },
    _loadRequiredFiles: function(required, callback) {
        var $this = this;
        if (required.css.length) {

            this.loadStyleSheet(required.css.shift(), function() {
                if (!required.css.length) {
                    $this._loadRequiredFiles(required, callback);
                }
            });

        } else {

            if (required.js.length) {

                this.loadJavascript(required.js.shift(), function() {
                    if (!required.js.length) {
                        $this._loadRequiredFiles(required, callback);
                    } else {
                        callback();
                    }
                });
            } else {
                callback();
            }
        }
    },
    loadStyleSheet: function(path, fn, scope) {
        var head = document.getElementsByTagName('head')[0], // reference to document.head for appending/ removing link nodes
            link = document.createElement('link'); // create the link node
        link.setAttribute('href', path);
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');

        var sheet, cssRules;
        // get the correct properties to check for depending on the browser
        if ('sheet' in link) {
            sheet = 'sheet';
            cssRules = 'cssRules';
        } else {
            sheet = 'styleSheet';
            cssRules = 'rules';
        }

        var interval_id = setInterval(function() { // start checking whether the style sheet has successfully loaded
            try {
                if (link[sheet] && link[sheet][cssRules].length) { // SUCCESS! our style sheet has loaded
                    clearInterval(interval_id); // clear the counters
                    clearTimeout(timeout_id);
                    fn.call(scope || window, true, link); // fire the callback with success == true
                }
            } catch (e) {} finally {}
        }, 10), // how often to check if the stylesheet is loaded
            timeout_id = setTimeout(function() { // start counting down till fail
                clearInterval(interval_id); // clear the counters
                clearTimeout(timeout_id);
                head.removeChild(link); // since the style sheet didn't load, remove the link node from the DOM
                fn.call(scope || window, false, link); // fire the callback with success == false
            }, 15000); // how long to wait before failing

        head.appendChild(link); // insert the link node into the DOM and start loading the style sheet

        return link; // return the link node;
    },
    loadJavascript: function(src, callback) {
        var script = document.createElement('script'),
            loaded;
        script.setAttribute('src', src);
        if (callback) {
            script.onreadystatechange = script.onload = function() {
                if (!loaded) {
                    callback();
                }
                loaded = true;
            };
        }
        document.getElementsByTagName('head')[0].appendChild(script);
    }
});