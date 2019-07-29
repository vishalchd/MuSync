(function ($) {
    "use strict";

    jQuery(document).ready(function ($) {

        /*masonary active*/
        // $(".image-list").masonry();


        /* $(window).bind("scroll", function () {
            $(window).height();
            $(window).scrollTop() > 100 && $(".header-area").addClass("fixed"), $(window).scrollTop() < 111 && $(".header-area").removeClass("fixed")
        }); */


        $(".bxslider").owlCarousel({
        	items: 1,
        	dots: true,
        	nav: true,
        	autoplay: true,
        	navText: ["<i class='fa fa-angle-left'></i>","<i class='fa fa-angle-right'></i>"],
        	loop: true,
        	animateOut: 'fadeOut'

        });





        // if ($(window).width() > 767) {
        //     var s = skrollr.init({forceHeight: false});
        // }

        // disable skrollr if the window is resized below 768px wide
        // $(window).on('resize', function () {
        //     if ($(window).width() <= 767) {
        //         skrollr.init().destroy(); // skrollr.init() returns the singleton created above
        //         $('.overlay').css({'background-attachment':'local'});
        //     }
        // });
        
        $(".toggle-preview-1").hover(function(){
            $(".first-review.preview-image-holder").addClass("active");
            }, function(){
                $(".first-review.preview-image-holder").removeClass("active");
        });
        $(".toggle-preview-2").hover(function(){
            $(".second-review.preview-image-holder").addClass("active");
            }, function(){
                $(".second-review.preview-image-holder").removeClass("active");
        });
        $(".toggle-preview-3").hover(function(){
            $(".third-review.preview-image-holder").addClass("active");
            }, function(){
                $(".third-review.preview-image-holder").removeClass("active");
        });

    });


    $("a").on('click', function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function() {
                window.location.hash = hash;
            });
        }
    });


    $(".responsive-menu-trigger").on("click", function () {
        $(".off-canvas-menu,.responsive-menu-trigger").addClass("active");
        return false;
    });

    $(".menu-close").on("click", function () {
        $(".off-canvas-menu,.responsive-menu-trigger").removeClass("active");
    });

    

    window.sr = ScrollReveal({ reset: false });
    
    // Customizing a reveal set
    // sr.reveal('.promise-section', { duration: 200 });

    window.sr = ScrollReveal();
    sr.reveal('.promise-section');
    sr.reveal('.scroll_reveal');
    
    // as a DOM node...
    // var scrollContainer = document.getElementById('features-section');
    // sr.reveal('.scroll_reveal', { container: scrollContainer });

    // as a selector...
    // sr.reveal('.scroll_reveal', { container: '#features-section' });
    


    jQuery(window).load(function () {


    });


}(jQuery));