$(function () {
    var $btn = $('#submit');
    var $url = $('#url');

    var options = {
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
        },
        start: function () {
            loading.spinner = new Spinner(loading.spinOpts);
            loading.spinner.spin(loading.target);
            $url.attr('disabled', true);
        },
    }, ui = {
        results: function (url) {
            console.log('Showing url = ' + url);
        }
    }, submit = {
        press: function () {
            console.log('Submit button pressed');

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
            console.log('Silent search called');
            silent.finished = undefined;

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
    };

    //
    // Attach Event Handlers
    //

    $url.search({
        search: silent.search,
        delay: options.delay,
    });

    $btn.click(submit.press);
});
