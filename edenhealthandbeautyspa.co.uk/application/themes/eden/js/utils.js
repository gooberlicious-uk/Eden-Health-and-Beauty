/*  Site-wide JS utility functions
*/

$(document).ready(function(){

    /*
    *
    * Add smooth scrolling to all anchor links
    *
    */

    $("a").on('click', function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function(){
                window.location.hash = hash;
            });
        }
    });

  /*
  *
  * Navigate to anchor links from URL #
  *
  */

  var q = getUrlQuery ();
  //console.log (q['filter']);
  if (q['scrollto']) {
      $('html, body').animate({
        scrollTop: $('#' + q['scrollto']).offset().top
      }, 800, function(){
        window.location.hash = '#' + q['scrollto'];
      });
  }

  /*
  *
  * Disable 1st level nav links (all have dropdowns)
  *
  */

  $('nav .nav >li >a').click( function (event){
      event.preventDefault();
  });

  /*
  *
  * Mobile nav toggle
  *
  */

  $('.nav-toggle').click( function () {
      var isopen = $('.nav-mobile-nav').hasClass('is-open');
      if (isopen) {
          $('.nav-mobile-nav').removeClass('is-open');
          $('body').css('overflow-y','auto');
      }else{
          $('.nav-mobile-nav').addClass('is-open');
          $('body').css('overflow-y','hidden');
      }
  });



});



$(window).on('load', function(){
    /*
    *
    * toggle classes for js dependencies
    *
    */
    $('.wait-for-js').addClass('js-loaded');
})

/*
*
* Get URL queries as array
*
*/

function getUrlQuery () {
    var vars = [], hash;
    var q = document.URL.split('?')[1];
    if(q != undefined){
        q = q.split('&');
        for(var i = 0; i < q.length; i++){
            hash = q[i].split('=');
            vars.push(hash[1]);
            vars[hash[0]] = hash[1];
        }
    } else {
        return false;
    }
    return vars;
}

/*
*
* Show top link on scroll
*
*/

$( window ).scroll(function() {
    if ($(window).scrollTop() > 200) {
        $('.top-link').css('opacity',1);
    }else{
        $('.top-link').css('opacity',0);
    }
});
