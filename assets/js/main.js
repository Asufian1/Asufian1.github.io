(function($) {

    var $window = $(window),
        $body = $('body'),
        $wrapper = $('#wrapper'),
        $header = $('#header'),
        $footer = $('#footer'),
        $main = $('#main'),
        $main_articles = $main.children('article');

    // Breakpoints.
    breakpoints({
        xlarge:   [ '1281px',  '1680px' ],
        large:    [ '981px',   '1280px' ],
        medium:   [ '737px',   '980px'  ],
        small:    [ '481px',   '736px'  ],
        xsmall:   [ '361px',   '480px'  ],
        xxsmall:  [ null,      '360px'  ]
    });

    // Play initial animations on page load.
    $window.on('load', function() {
        window.setTimeout(function() {
            $body.removeClass('is-preload');
        }, 100);
    });

    // Fix: Flexbox min-height bug on IE.
    if (browser.name == 'ie') {
        var flexboxFixTimeoutId;

        $window.on('resize.flexbox-fix', function() {
            clearTimeout(flexboxFixTimeoutId);
            flexboxFixTimeoutId = setTimeout(function() {
                if ($wrapper.prop('scrollHeight') > $window.height())
                    $wrapper.css('height', 'auto');
                else
                    $wrapper.css('height', '100vh');
            }, 250);
        }).triggerHandler('resize.flexbox-fix');
    }

    // Form Validation
    function validateForm() {
        var name = document.getElementById("name").value;
        var email = document.getElementById("email").value;
        var message = document.getElementById("message").value;
        var errorMessage = document.getElementById("error-message");
        var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

        // Clear previous error messages
        errorMessage.innerHTML = "";

        if (name == "" || email == "" || message == "") {
            errorMessage.innerHTML = "Please fill out all fields (name, email, and message).";
            return false;
        }

        if (!emailPattern.test(email)) {
            errorMessage.innerHTML = "Please enter a valid email address.";
            return false;
        }

        return true;
    }

    // Attach form validation to form submission
    document.getElementById("contactForm").addEventListener("submit", async function (event) {
		event.preventDefault();  // Prevent the default form submission
	
		// Get form data
		const formData = new FormData(this);
	
		// Send the form data to Formspree via Fetch API
		const response = await fetch("https://formspree.io/f/xyzyzvlw", {
			method: "POST",
			body: formData,
			headers: {
				'Accept': 'application/json'
			}
		});
	
		// Check if the submission was successful
		if (response.ok) {
			document.getElementById("successMessage").style.display = "block";  // Show success message
			document.getElementById("errorMessage").style.display = "none";     // Hide error message if displayed
			document.getElementById("contactForm").reset();  // Reset the form
		} else {
			document.getElementById("successMessage").style.display = "none";  // Hide success message if displayed
			document.getElementById("errorMessage").style.display = "block";   // Show error message
		}
	});
	

    // Nav.
    var $nav = $header.children('nav'),
        $nav_li = $nav.find('li');

    if ($nav_li.length % 2 == 0) {
        $nav.addClass('use-middle');
        $nav_li.eq(($nav_li.length / 2)).addClass('is-middle');
    }

    var delay = 325,
        locked = false;

    $main._show = function(id, initial) {
        var $article = $main_articles.filter('#' + id);

        if ($article.length == 0)
            return;

        if (locked || (typeof initial != 'undefined' && initial === true)) {
            $body.addClass('is-switching');
            $body.addClass('is-article-visible');
            $main_articles.removeClass('active');
            $header.hide();
            $footer.hide();
            $main.show();
            $article.show();
            $article.addClass('active');
            locked = false;
            setTimeout(function() {
                $body.removeClass('is-switching');
            }, (initial ? 1000 : 0));
            return;
        }

        locked = true;

        if ($body.hasClass('is-article-visible')) {
            var $currentArticle = $main_articles.filter('.active');
            $currentArticle.removeClass('active');
            setTimeout(function() {
                $currentArticle.hide();
                $article.show();
                setTimeout(function() {
                    $article.addClass('active');
                    $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
                    setTimeout(function() {
                        locked = false;
                    }, delay);
                }, 25);
            }, delay);
        } else {
            $body.addClass('is-article-visible');
            setTimeout(function() {
                $header.hide();
                $footer.hide();
                $main.show();
                $article.show();
                setTimeout(function() {
                    $article.addClass('active');
                    $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
                    setTimeout(function() {
                        locked = false;
                    }, delay);
                }, 25);
            }, delay);
        }
    };

    $main._hide = function(addState) {
        var $article = $main_articles.filter('.active');

        if (!$body.hasClass('is-article-visible'))
            return;

        if (typeof addState != 'undefined' && addState === true)
            history.pushState(null, null, '#');

        if (locked) {
            $body.addClass('is-switching');
            $article.removeClass('active');
            $article.hide();
            $main.hide();
            $footer.show();
            $header.show();
            $body.removeClass('is-article-visible');
            locked = false;
            $body.removeClass('is-switching');
            $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
            return;
        }

        locked = true;
        $article.removeClass('active');
        setTimeout(function() {
            $article.hide();
            $main.hide();
            $footer.show();
            $header.show();
            setTimeout(function() {
                $body.removeClass('is-article-visible');
                $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
                setTimeout(function() {
                    locked = false;
                }, delay);
            }, 25);
        }, delay);
    };

    $main_articles.each(function() {
        var $this = $(this);
        $('<div class="close">Close</div>')
            .appendTo($this)
            .on('click', function() {
                location.hash = '';
            });
        $this.on('click', function(event) {
            event.stopPropagation();
        });
    });

    $body.on('click', function(event) {
        if ($body.hasClass('is-article-visible'))
            $main._hide(true);
    });

    $window.on('keyup', function(event) {
        switch (event.keyCode) {
            case 27:
                if ($body.hasClass('is-article-visible'))
                    $main._hide(true);
                break;
            default:
                break;
        }
    });

    $window.on('hashchange', function(event) {
        if (location.hash == '' || location.hash == '#') {
            event.preventDefault();
            event.stopPropagation();
            $main._hide();
        } else if ($main_articles.filter(location.hash).length > 0) {
            event.preventDefault();
            event.stopPropagation();
            $main._show(location.hash.substr(1));
        }
    });

    if ('scrollRestoration' in history)
        history.scrollRestoration = 'manual';
    else {
        var oldScrollPos = 0,
            scrollPos = 0,
            $htmlbody = $('html,body');
        $window.on('scroll', function() {
            oldScrollPos = scrollPos;
            scrollPos = $htmlbody.scrollTop();
        }).on('hashchange', function() {
            $window.scrollTop(oldScrollPos);
        });
    }

    $main.hide();
    $main_articles.hide();
    if (location.hash != '' && location.hash != '#')
        $window.on('load', function() {
            $main._show(location.hash.substr(1), true);
        });

})(jQuery);
