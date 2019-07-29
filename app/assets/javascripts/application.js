// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//require turbolinks
//= require jquery
//= require bootstrap-sprockets
//= require noty/lib/noty
//= require perfect-scrollbar.min
//= require bootstrap-selectpicker
//= require bootstrap-switch-tags
//= require flatpickr/dist/flatpickr
//= require cocoon
//= require notifications
//= require moment.min
//= require_tree ./admin
//= require paper-dashboard
//= require bootstrap-notify
//= require demo
//= require jquery.rateyo


function onPageLoad(){
  var ctrl, func_name, func;

  // $('.selectpicker').selectpicker({ size: false } );

  ctrl = $('#ctrl').data('name');

  if(ctrl){
    func_name = ctrl.replace(/\//g , '_');
    func = window[func_name];

    if(func){
      func();
    }
  }

  $('#c_year').html(new Date().getFullYear())

  $('.main-panel').perfectScrollbar()
  $('[data-toggle="tooltip"]').tooltip();


  if(initPaperTheme){
    initPaperTheme();
  }

  // Set Z-index of notification growl
  $("div.col-xs-11.col-sm-4.alert.alert-info.animated.fadeInDown").css("z-index", '999999')
  var $loading = $('.loader');
  //Attach the event handler to any element
  $(document)
    .ajaxStart(function () {
      //ajax request went so show the loading image
      console.log("Hello")
      $loading.css('display','block');
    })
  .ajaxStop(function () {
      //got response so hide the loading image
      console.log("Stop")

      $loading.css('display','none');
  });
}



// document.addEventListener("turbolinks:load", onPageLoad)

$(document).ready(onPageLoad);
