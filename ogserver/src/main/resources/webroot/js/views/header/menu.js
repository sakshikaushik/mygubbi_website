define([
  'jquery',
  'lodash',
  'backbone',
  'bootstrap',
  'text!templates/header/menu.html'
], function($, _, Backbone, Bootstrap, headerMenuTemplate){
  var HeaderMenuView = Backbone.View.extend({
    el: '.main-menu-container',
    initialize: function () {
    },
    render: function () {
      $(this.el).html(headerMenuTemplate);
      $('a[href="' + window.location.hash + '"]').addClass('active');
    },
    events: {
      'click a': 'highlightMenuItem'
    },
    highlightMenuItem: function (ev) {
      $('.active').removeClass('active');
      $(ev.currentTarget).addClass('active');
    }
  })

  return HeaderMenuView;
});