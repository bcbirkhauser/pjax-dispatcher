pjax-dispatcher
===============

A way to automatically call classes or functions on pjax page changes.

I needed a way to load javascript and css classes and call different classes and methods when the url changed, so I wrote this class to do just that. I wanted to have the flexibility to define custom routes or let the dispatcher figure out which class and method to call based on the url. It's modeled after how CakePhp handles it's routes, so it uses controller(class) and action(method).

It requires [jquery](https://github.com/jquery/jquery), [jquery-pjax](https://github.com/defunkt/jquery-pjax) and [toast](https://github.com/pyrsmk/toast) and John Resig's [class script](http://ejohn.org/blog/simple-javascript-inheritance/)


##How To Use
create a new instance of the dispatcher and optionally pass it an object of route definitions.

The very basic way to implement
```javascript
var dispatcher = new Dispatcher();
```

Defining custom routes in the constructor
```javascript
var dispatcher = new Dispatcher({
	/somecool/route/: function() {
		//do stuff here
	},
	/another/route/: myClass.someMethod
});
```

You can also add routes later by calling the route method
```javascript
var dispatcher = new Dispatcher();
dispatcher.route('/newroute/', myClass, myMethod);
```

If you need to load any javascript or css before your functions are called, use the before function.  This function takes three arguments: the route, an array of files to load in the toast style, and an optional callback function.

```javascript
var dispatcher = new Dispatcher();
dispatcher.before('/loadbefore/route/', ['myclass.js', 'mycustom.css']);
```