require.config({
  paths: {
    jquery: 'libs/jquery/dist/jquery.min',
    jqueryui: 'libs/jquery-ui/jquery-ui',
    underscore: 'libs/underscore/underscore-min',
    backbone: 'libs/backbone/backbone-min',
    text: 'libs/text/text',
    jqueryeasing: 'libs/jquery.easing/js/jquery.easing.min',
    sly: 'libs/sly/dist/sly',
    bootstrap: 'libs/bootstrap-custom/js/bootstrap.min',
    bootstrapvalidator: 'libs/bootstrap-validator/dist/validator.min',
    firebase: 'libs/firebase/firebase',
    templates: '../templates'
  },
  shim: {
    'bootstrap': {
        deps: ['jquery', 'jqueryui'],
        exports: 'Bootstrap'
    },
    'bootstrapvalidator': {
            deps: ['bootstrap', 'jquery'],
            exports: 'Bootstrapvalidator'
    },
    'backbone': {
        deps: ['underscore', 'jquery'],
        exports: function() {
            return Backbone.noConflict();
        }
    },
    'firebase': {
        deps: ['jquery'],
        exports: 'firebase'
    }
  },
  map: {
    '*': {
      'css': 'libs/require-css/css'
    }
  }
});

require([
  'views/app',
  'router'
], function(AppView, Router){
  var appView = new AppView();
  appView.render();
  Router.initialize({"appView": appView});
});

var imgBase = "https://res.cloudinary.com/mygubbi/image/upload/";
//var restBase = "https://localhost:8080";
//var restBase = "https://ec2-52-74-136-198.ap-southeast-1.compute.amazonaws.com:8080";
var restBase = "";
