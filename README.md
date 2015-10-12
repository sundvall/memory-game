# memory-game
Classic game of 'memory' for the browser.

Entry point for the game-build is:
memory-game->app->src->game->lib->index.js

Entry-point for helper-functions
memory-game->app->src->common->lib->index.js

Jquery is used by the ajax-procedure in 
memory-game->app->src->common->lib->utils->jqajx_crossdomain.js

Dom-tests are performed with qunit.

Dist-folder contains occassional builds.
Version-folder contains permanent builds.




## development
Details about tools and architecture.  

### about  
The application is build with gulp and browserify. See the 'package.json' for all modules used during development. The architecture is based on 'flux' -
[http://facebook.github.io/flux/docs/overview.html](http://facebook.github.io/flux/docs/overview.html), and modified to ES5 syntax. The view system is based on one control ('view.js') which uses utilitiy modules from the 'utils' folder. The main purpose of the modules are to keep them small and dedicated to one task each.  
Entry point for the js-bundling is 'index.js' and dependencies are seen in the 'require' calls.  
The idea of the architecture is to separate the modules using a facade-pattern and the action-flow.

### build 
npm install

gulp

### build for production
A version is added to the 'versions'-folder containing a versionnumber.
gulp build
