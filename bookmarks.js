/// <reference path="jquery.d.ts" />
"use strict";
$(document).ready(function () {
    $.get("data.xml", parseBookmarks, "html");
    $.get("top-notes.txt", fillNotes);

    $("input#update").click(function (eventObject) {
        $("input[name='top_notes_text']").val($("#top-notes").html());
        if ($("#book-xml").is(":visible") == false) {
            $("#book-xml-text").text(""); // do not post something that hasn't changed
        }
        $("#form-upload").submit();
    });

    $("#bookmarks-export").click(function (eventObject) {
        $("#book-xml").show();
    });

    $("body").css("background-color", $("div.toolbar").css("background-color"));

    $("#label-search").focus().click(function (e) {
        $("#form-search input").focus();
        return false;
    });
});

var Book = (function () {
    function Book(title, url, tags) {
        this.title = title;
        this.url = url;
        this.tags = tags;
    }
    return Book;
})();

function parseBookmarks(data) {
    $("#book-xml-text").text(data);

    var xmlDoc = $.parseXML(data);
    var $xml = $(xmlDoc);

    var $books = $xml.find("bookmark");

    var books = $books.map(function (index, element) {
        var $elem = $(element);
        var title = $elem.find("title").text();
        var url = $elem.find("url").text();

        var $labels = $elem.find("label");
        var tags = $labels.map(function (index, element) {
            return $(element).text();
        }).get();

        return new Book(title, url, tags);
    }).get();

    $("div.gadget").each(function (index, element) {
        var $elem = $(element);
        var label = $elem.attr("id");
        var bb = filterByLabel(books, label);
        if (bb.length > 0) {
            var pagesize = 9999;
            var pagecount = 0;
            var sort = false;

            if ($elem.attr("data-page-size") != undefined) {
                pagesize = parseInt($elem.attr("data-page-size"));
                pagecount = Math.max(0, Math.floor((bb.length - 1) / pagesize));
            }

            if ($elem.attr("data-sort") != undefined) {
                sort = ($elem.attr("data-sort") == "true");
                if (sort) {
                    bb.sort(function (a, b) {
                        var alow = a.title.toLowerCase();
                        var blow = b.title.toLowerCase();
                        if (alow < blow) {
                            return -1;
                        } else if (alow > blow) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                }
            }

            var $div = $("<div/>");

            var labelHref = "https://www.google.com/bookmarks/lookup?q=label:" + label + "&hl=en";

            var $divLabel = "<div class='label'><a href='" + labelHref + "' target='_blank'>" + label + "</a></div>";
            $div.append($divLabel);

            var currentPage = 0;
            var $divPage = $("<div class='page' data-page='0'/>");

            for (var i = 0; i < bb.length; i++) {
                var book = bb[i];
                var page = Math.floor(i / pagesize);

                if (page != currentPage) {
                    $div.append($divPage);
                    $divPage = $("<div class='page' data-page='" + page + "' style='display:none;'/>");
                    currentPage = page;
                }
                $divPage.append("<div class='durl'><a class='aurl' href='" + book.url + "' target='_blank'>" + book.title + "</a></div>");
            }
            $div.append($divPage);

            if (pagecount > 0) {
                var $divPager = $("<div class='pager'/>");
                for (var page = 0; page <= pagecount; page++) {
                    $divPager.append("<a class='apager' data-page=" + page.toString() + " href='#'>" + (page + 1).toString() + "</a>");
                }
                $div.append($divPager);
            }

            $elem.append($div);
        }
    });

    $("div.gadget").on("click", "a.apager", function (eventObject) {
        var $target = $(eventObject.target);
        var $gadget = $target.closest("div.gadget");
        var page = $target.attr("data-page");

        $gadget.find("div.page").hide(150);
        $gadget.find("div.page[data-page='" + page + "']").show(150);

        $target.siblings().removeClass("selected");
        $target.addClass("selected");
    });
}

function filterByLabel(books, label) {
    var filtered = new Array();
    $.each(books, function (indexInArray, valueOfElement) {
        if ($.inArray(label, books[indexInArray].tags) != -1) {
            filtered.push(books[indexInArray]);
        }
    });
    return filtered;
}

function fillNotes(data) {
    $("div#top-notes").html(data);
}
//# sourceMappingURL=bookmarks.js.map
