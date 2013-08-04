$(function () {
    var $btn = $('#convert'),
        $form = $('form'),
        $tmpl = $('#template'),
        $url = $('#url'),
        $links = $('.links'),
        $ul = $('.links ul'),
        $tag = $('#tag'),
        $status = $('#status'),
        $nut = $('.logo .nut img'),
        links = 0,
        previous;

    var options = {
        host: 'http://anut.sh/',
        taglineChange: 5,
        nutStart: 6,
        nutEnd: 8,
        submit: '/',
        delay: 350,
    };

    // Eventually this will be a 'loading' spinner or
    // something
    var loading = {
        target: document.getElementById('spinner'),
        spinOpts:  {
            lines: 13,
            length: 8,
            width: 3,
            radius: 5,
            corners: 1,
        },
        done: function () {
            if (loading.spinner) {
                loading.spinner.stop();
            }

            $url.attr('disabled', false);
            $btn.attr('disabled', false);
        },
        start: function () {
            loading.spinner = new Spinner(loading.spinOpts);
            loading.spinner.spin(loading.target);
            $url.attr('disabled', true);
            $btn.attr('disabled', true);
        },
    }, ui = {
        results: function (url) {
            var $this = $(this),
                $clone = $tmpl.clone().attr('id', ''),
                $button = $clone.find('button'),
                $input = $clone.find('input');

            console.log('Submit button pressed');

            if (links === 0) {
                $status.text(nutshell.ask(links));
            } else {
                $status.fadeOut(400, function () {
                    $status.text(nutshell.ask(links));
                    $status.fadeIn(400);
                });
            }

            $links.removeClass('hide');

            $clone.addClass('link');
            $ul.prepend($clone);

            $input.attr('id', 'link' + links);
            $input.val(options.host + url);
            $input.focus().select();

            $button.attr('data-clipboard-text', options.host + url);

            var clip = new ZeroClipboard($button[0], {
                moviePath: "/lib/zeroclipboard/ZeroClipboard.swf"
            });

            clip.on('complete', function () {
                $(this).button('toggle')
                       .text('Copied')
                       .attr('disabled', true);
            });

            links += 1;
        }
    }, submit = {
        click: function () {
            $btn.trigger('click');
            return false;
        },
        press: function () {
            var url = $url.val();
            if (!url.match(/^[a-zA-Z]+:\/\//))
                url = 'http://' + url;

            if (!isUrl(url)) {
                $status.text(nutshell.error());
                return;
            }

            loading.start();

            $.ajax({
                url: options.submit,
                type: 'post',
                dataType: 'json',
                data: {
                    url: $url.val(),
                },
                success: submit.success,
                error: submit.error,
            });
        },
        success: function (data) {
            ui.results(data.url);
            loading.done();
        },
        error: function (data) {
            console.log('error in submit');
            loading.done();
        },
    }, silent = {
        search: function () {
            var url = $url.val();

            if (!isUrl(url)) {
                $status.text(nutshell.error());
                return;
            }

            if (url != previous) {
                url = previous;
                // Reset everything
                $links.find('.link').remove();
                $status.text('');
                links = 0;
            }

            console.log('Silent search called');
            silent.finished = undefined;
            previous = url;

            $btn.unbind();
            $btn.click(silent.press);

            $.ajax({
                url: options.submit,
                type: 'post',
                dataType: 'json',
                data: {
                    url: $url.val(),
                },
                success: silent.success,
                error: silent.error,
            });
        },
        press: function (event) {
            var url = $url.val();

            if (!isUrl(url)) {
                $status.text(nutshell.error());
                return;
            }

            console.log('intercepted button');
            if (silent.finished) {
                ui.results(silent.finished.url);
            } else {
                loading.start();
            }

            // Do regardless
            $btn.unbind();
            $btn.click(submit.press);
        },
        success: function (data) {
            silent.finished = data;
            loading.done();
        },
        error: function (data) {
            console.log('silent error');
        },
    }, tagline = function () {
        $tag.fadeOut(400, function () {
            $tag.text(nutshell.tag());
            $tag.fadeIn(400);
        });
    }, isUrl = function (url) {
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    	return regexp.test(url);
	}, shakeNuts = {
        start: function () {
            $nut.addClass('animated swing');
        },
        end: function () {
            $nut.removeClass('animated swing');
        }
    };
    //
    // Attach Event Handlers
    //

    $url.search({
        search: silent.search,
        delay: options.delay,
    });

    $btn.click(submit.press);
    $btn.click(submit.press);
    $form.submit(submit.click);

    //$nut.hover(shakeNuts);

    //
    // Setup Timeouts
    //

    setInterval(tagline, options.taglineChange * 1000);
    setInterval(shakeNuts.start, options.nutStart * 1000);
    setInterval(shakeNuts.end, options.nutEnd * 1000);

    //
    // Setup Copy & Paste
    //

    $url.focus();
});
