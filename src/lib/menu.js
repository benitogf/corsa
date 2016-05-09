'use strict';

var menu = {
  init: function(){
        if (!$('#navToggle').prop('checked')) $('#navToggle').click();
        $('#navToggle').on('change', function (e) {
            var id = this.id;
            $('.multiCheck').each(function () {
                if (id !== this.id) $(this).prop('checked', false);
            });
            if (!$(this).prop('checked'))
               $('.multiCheck').each(function () {
                   var multiCheck = this;
                   $(this.parentNode).find('.dropdown li a').each(function(){
                     if ($(this).hasClass('active')) $(multiCheck).prop('checked', true);
                   });
               });
        });
        $('.multiCheck').click(function (e) {
            var id = this.id;
            $('.multiCheck').each(function () {
                if (id !== this.id) $(this).prop('checked', false);
            });
        });
        app.routes = [];
        $('header.navmenu nav ul li a').each(function (ind, e) {
            app.routes.push($(e).data('page'));
        });
        $('header.navmenu nav ul li a').click(function (event) {
            var page = $(event.target).data('page');
            var indexPath = (app.routes.indexOf(page) !== -1) ? app.routes.indexOf(page) : 0;
            //console.log(page);
            $('header.navmenu nav ul li a').removeClass('active');
            $('header.navmenu nav ul li a').eq(indexPath).addClass('active');
            $('.multiCheck').each(function () {
               $(this).prop('checked', false);
            });
            $('#navToggle').click();
        });
  },
  path: function(path){
    var menuPath = (app.routes.indexOf(path) !== -1) ? app.routes.indexOf(path) : 0;
    $('header.navmenu nav ul li a').removeClass('active');
    $('header.navmenu nav ul li a').eq(menuPath).addClass('active');
  }
};
if ( typeof module === 'object' ) {

	module.exports = menu;

}
