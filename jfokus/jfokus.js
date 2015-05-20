/*jslint browser: true*/
/*global $, Handlebars, alert*/
(function () {
    "use strict";

    var JFokus = {
        useYql: true,
        baseUrl: 'http://www.jfokus.se/rest/v1/events',
        selEventId: null,
        getTemplate: function (templateName) {
            if (!JFokus.compiledTemplates[templateName]) {
                JFokus.doInitHelpers();
                JFokus.compiledTemplates[templateName] = Handlebars.compile($(templateName).html());
            }
            return JFokus.compiledTemplates[templateName];
        },
        doInitHelpers: function () {
            if (!JFokus.initedTemplates) {
                Handlebars.registerHelper('substr', function (start, end, context) {
                    return context.substring(start, end);
                });
                JFokus.initedTemplates = true;
            }
        },
        compiledTemplates : {},
        initedTemplates: false,
        loadingPageShown: false,
        ajaxCache: {}
    };

    function getYql(site) {
        if (JFokus.useYql) {
            return 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + site + '"') + '&format=json&callback=?';
        }
        return site;
    }

    function getDataForTemplate(config) {
        var handleResponse, cachedData;
        handleResponse = function (data, cached) {
            if (!cached && config.dataProcessFnc !== undefined) {
                config.dataProcessFnc(data);
            }
            var ulul = $(config.ul);
            if (config.emptyContainer !== false) {
                ulul.empty();
            }
            ulul.append(config.template(data));
            try {
                ulul.listview("refresh");
            } catch (e) {}
            if (config.postFnc !== undefined) {
                config.postFnc(config, data);
            }
        };
        cachedData = JFokus.ajaxCache[config.url];

        if (cachedData) {
            handleResponse(cachedData, true);
        } else {
            $.mobile.loading('show');
            $.getJSON(getYql(config.url), function (response) {
                var data = { items: null };

                if (JFokus.useYql) {
                    if (response.query.results === null) {
                        alert('Something went wrong with your YQL request. Maybe you reached your api quota limit. It is reset every hour.');
                    }
                    data.items = $.parseJSON(response.query.results.body.p);
                } else {
                    data.items = response;
                }

                JFokus.ajaxCache[config.url] = data;
                handleResponse(data, false);
            }).complete(function () {
                $.mobile.loading('hide');
            });
        }
    }

    function getPresentationDetails(presUri, backUri) {
        getDataForTemplate({
            url: presUri,
            ul: '#presentationDetailsUl',
            template: JFokus.getTemplate('#presentationDetails-template'),
            dataProcessFnc: function (data) {
                if (data.items.tags && data.items.tags.length > 0) {
                    data.items.tags[data.items.tags.length - 1].last = true;
                }
            },
            postFnc: function (config, data) {
                var ii;
                $.mobile.changePage($('#presentationDetailsPage'));
                $('#presentationDetailsBackButton').attr("href", backUri);
                for (ii = 0; ii < data.items.speakers.length; ii += 1) {
                    getDataForTemplate({
                        url: data.items.speakers[ii].speakerUri,
                        ul: '#presentationSpeakerDetail',
                        emptyContainer: false,
                        template: JFokus.getTemplate('#presentationSpeaker-template')
                    });
                }
            }
        });
    }

    function clearFilter(page) {
        $(page + ' form.ui-listview-filter input').each(function () {
            $(this).val('');
        });
    }

    function getScheduleList(day, eventId) {
        getDataForTemplate({
            url: JFokus.baseUrl + '/' + eventId + '/schedule/day/' + day,
            ul: '#scheduleUl',
            template: JFokus.getTemplate('#schedule-template'),
            postFnc: function () {
                $('.windows8').hide();
                clearFilter('#schedulePage');
                $.mobile.changePage($('#schedulePage'));
            },
            dataProcessFnc: function (data) {
                var i, it, prevIt;
                data.items.sort(function (a, b) {
                    var diff = a.fromTime.localeCompare(b.fromTime);
                    if (diff === 0) {
                        diff = a.room.localeCompare(b.room);
                    }
                    return diff;
                });
                for (i = 1; i < data.items.length; i += 1) {
                    it = data.items[i];
                    prevIt = data.items[i - 1];
                    if (it.fromTime !== prevIt.fromTime &&
                            (it.type === "CONFERENCE" || it.type === "QUICKIE") &&
                            (prevIt.type === "CONFERENCE" || prevIt.type === "QUICKIE")) {
                        data.items.splice(i, 0, {
                            code: 'Break'
                        });
                    }
                }
            }
        });
    }

    function getDayFromLocalStorage() {
        try {
            var day, dayIdx;
            day = localStorage.getItem('selday');
            if (day === null || day === undefined) {
                day = 1;
            }
            $('#daynavbar li a').removeClass('ui-btn-active');
            dayIdx = day - 1;
            $('#daynavbar li:eq(' + dayIdx + ') a').addClass('ui-btn-active');

            return day;
        } catch (e) {
            return 1;
        }
    }

    function saveDayToLocalStorage(day) {
        try {
            localStorage.setItem('selday', day);
        } catch (e) {
        }
    }

    $(document).bind("pagebeforechange", function (e, data) {
        if (typeof data.toPage === "string") {
            if (JFokus.selEventId === null) {
                data.toPage = $.mobile.path.parseUrl(data.toPage).hrefNoHash;
            }
        } else {
            if (JFokus.loadingPageShown && data.toPage.attr('id') === 'loadingPage') {
                if (JFokus.selEventId === null) {
                    data.toPage = $('#mainPage');
                } else {
                    data.toPage = $('#schedulePage');
                }
            }
        }
    });

    $('#loadingPage').live('pagebeforeshow', function (e) {
        JFokus.loadingPageShown = true;
        getDataForTemplate({
            url: JFokus.baseUrl,
            ul: '#mainUl',
            template: JFokus.getTemplate('#event-template'),
            postFnc: function (config, data) {
                if (data.items.length === 1) {
                    JFokus.selEventId = data.items[0].id;
                    getScheduleList(getDayFromLocalStorage(), JFokus.selEventId);
                } else {
                    $('.windows8').hide();
                    $.mobile.changePage($('#mainPage'));
                }
            }
        });
    });

    $('#mainPage').live('pageinit', function () {
        $("#mainUl").delegate(".listUlItem", "click", function () {
            JFokus.selEventId = this.id;
            getScheduleList(getDayFromLocalStorage(), this.id);
        });
    });

    $('#schedulePage').live('pageinit', function () {
        $("#daynavbar").delegate("li", "click", function () {
            var day = $(this).data('day');
            saveDayToLocalStorage(day);
            getScheduleList(day, JFokus.selEventId);
        });
        $("#scheduleUl").delegate(".listUlItem", "click", function () {
            var presUri = $(this).find('.hiddenPresUri').text();
            if (presUri.length > 0) {
                getPresentationDetails(presUri, '#schedulePage');
            }
        });
        $('#speakersButton').bind('click', function () {
            getDataForTemplate({
                url: JFokus.baseUrl + '/' + JFokus.selEventId + '/speakers',
                ul: '#speakersUl',
                template: JFokus.getTemplate('#speakers-template'),
                postFnc: function () {
                    clearFilter('#speakersPage');
                    $.mobile.changePage($('#speakersPage'));
                },
                dataProcessFnc: function (data) {
                    data.items.sort(function (a, b) {
                        var diff = a.firstName.localeCompare(b.firstName);
                        if (diff === 0) {
                            diff = a.lastName.localeCompare(b.lastName);
                        }
                        return diff;
                    });
                }
            });
        });
    });

    $('#speakersPage').live('pageinit', function () {
        $("#speakersUl").listview({
            autodividersSelector: function (li) {
                var out = li.find('h3').text()[0];
                return out;
            }
        });
        $("#speakersUl").listview('refresh');
        $("#speakersUl").delegate(".listUlItem", "click", function () {
            getDataForTemplate({
                url: JFokus.baseUrl + '/speakers/' + this.id,
                ul: '#speakerDetailsContent',
                template: JFokus.getTemplate('#speakerDetails-template'),
                postFnc: function () {
                    $.mobile.changePage($('#speakerDetailsPage'));
                    var listul = $('#speakerDetailsUl');
                    if (!listul.hasClass('ui-listview')) {
                        listul.listview();
                    }
                }
            });
        });
    });

    $('#speakerDetailsPage').live('pageinit', function () {
        $("#speakerDetailsContent").delegate("#speakerDetailsUl .listUlItem", "click", function () {
            var presUri = $(this).data('presuri');
            getPresentationDetails(presUri, '#speakerDetailsPage');
        });
    });

}());

