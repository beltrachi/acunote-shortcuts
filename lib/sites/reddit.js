/*
 *  ===========================================================
 *  Acunote Shortcuts: Reddit Support
 *  Copyright (c) 2008 Pluron, Inc.
 *  ===========================================================
 */
function RedditSource() {
    var RCursorHelp =
        '=== Cursor Movement ===\n' +
        'j - move cursor up\n' +
        'k - move cursor down\n' +
        '\n=== Post Management ===\n' +
        'o, <Enter> - open original post\n'+
        '<Shift>+o - open comments\n' +
        'u - back to news list\n' +
        '\n=== Voting ===\n' +
        'v u - vote up\n' +
        'v d - vote down\n' +
        '\n=== Browsing ===\n' +
        'g h - open "hot" page\n' +
        'g n - open "new" page\n' +
        'g b - open "browse" page\n' +
        'g s - open "saved" page\n' +
        'g r - open "recommended" page\n' +
        'g t - open "stats" page\n' +
        '\n=== Other ===\n' +
        '? - this help\n';

    var RCursorStyles = 
        '#shortcut_status { background: #f00;color: #fff;padding: 5px;position: absolute;bottom: 10px;right: 10px;}\n';


    var Cursor = {

        siteTable: null,
        siteTablePos: null,
        things: [],

        current: 0,

        init: function() {
            this.addStyles(RCursorStyles);
            this.siteTable = $('siteTable');

            if (this.siteTable) {
                this.siteTablePos = this.findPos(this.siteTable);
                var row = this.siteTable.firstChild;
                if (row) {
                    do {
                        if (row.id.match('thingrow_.*')) {
                            this.things.push(row);
                        }
                    } while (row = row.nextSibling);

                    this.current = 0;
                    if (readCookie('jumpToLast')) {
                        this.showCursor(this.things.length - 1);
                        createCookie('jumpToLast', '0', -1);
                    } else
                        this.showCursor(this.current);
                }
            }
            shortcutListener.init();
        },

        next: function() {
            var i = this.current + 1;
            if (i >= this.things.length) {
                this.nextPage();
                return false;
            }
            this.showCursor(i);
        },

        previous: function() {
            var i = this.current - 1;
            if (i < 0) {
                this.previousPage(true);
                return false;
            }
            this.showCursor(i);
        },

        nextPage: function() {
            this.prevOrNextPage('next');
        },

        previousPage: function(setCursorToLastPosition) {
            setCursorToLastPosition = setCursorToLastPosition || false;
            this.prevOrNextPage('prev', setCursorToLastPosition);
        },

        prevOrNextPage: function(mode, setCursorToLastPosition) {
            var element = this.siteTable.nextSibling.firstChild;
            while (element && element.innerHTML != mode)
                element = element.nextSibling;
            if (element && element.innerHTML == mode) {
                if (setCursorToLastPosition)
                    createCookie('jumpToLast', '1', 0);
                location.href = element.getAttribute('href');
            }
        },

        showCursor: function(i) {
            if (i<0) return false;
            this.hideCursor(this.current);

            row = this.things[i];
            numbercol = row.firstChild;
            if (numbercol.innerHTML != '') {
                numbercol.style.color = 'black';
                numbercol.style.borderBottom = 'medium solid black'
            } else {
                midcol = numbercol.nextSibling;
                midcol.style.borderBottom = 'medium solid black'
            }
            this.current = i;

            // move focus with cursor
            var a = $('title_'+this.currentLinkId());
            if (a) a.focus();

            var offset = window.pageYOffset;
            var innerHeight = window.innerHeight;
            var cursorPos = this.findPos(row);
            if ( (cursorPos < (offset + 58)) || (cursorPos > (offset+innerHeight-58))) {
                window.scrollTo(0, cursorPos - (innerHeight/2))
            }
        },

        hideCursor: function(i) {
            row = this.things[i];
            numbercol = row.firstChild;

            numbercol.style.color = 'darkgray';
            numbercol.style.borderBottom = '';
            numbercol.nextSibling.style.borderBottom = '';
        },

        voteUp: function() {
            $('up_'+this.currentLinkId()).onclick()
        },

        voteDown: function() {
            $('down_'+this.currentLinkId()).onclick()
        },

        openLink: function() {
            location.href = $('title_'+this.currentLinkId()).getAttribute('href');
        },

        openComments: function() {
            location.href = $('comment_'+this.currentLinkId()).firstChild.getAttribute('href');
        },

        go: function(page) {
            var element = $('topstrip').firstChild;
            while (element.innerHTML != page)
                element = element.nextSibling;
            if (element && element.innerHTML == page)
                location.href = element.getAttribute('href');
        },

        goBack: function() {
            if (
                location.href.match('comments') ||
                location.href.match('user') 
            ) history.back();
        },

        help: function() {
            alert(RCursorHelp);
        },

        findPos: function (obj) {
            if (!obj) return 0;
            var curtop = 0;
            if (obj.offsetParent) {
                curtop = obj.offsetTop;
                while (obj = obj.offsetParent) {
                    curtop += obj.offsetTop;
                }
            }
            return curtop;
        },

        findRowPos: function(row) {
            if (!row) return 0;
            return this.siteTablePos + row.offsetTop;
        },

        linkId: function(row) {
            return row.id.match(/thingrow_(.*)/)[1];
        },

        currentLinkId: function() {
            return this.linkId(this.things[this.current]);
        },

        addStyles: function(css) {
            var head, style, text;
            head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            style = document.createElement('style');
            style.type = 'text/css';
            text = document.createTextNode(css);
            style.appendChild(text);
            head.appendChild(style);
        }

    }


    var SHORTCUTS = {
        '?': function() { Cursor.help(); },
        'h': function() { Cursor.help(); },
        'j': function() { Cursor.next(); },
        'k': function() { Cursor.previous(); },
        'o': function() { Cursor.openLink(); },
        'O': function() { Cursor.openComments(); },
        'u': function() { Cursor.goBack(); },
        'v': {
            'u': function() { Cursor.voteUp(); },
            'd': function() { Cursor.voteDown(); },
        },
        'g': {
            'h': function() { Cursor.go('hot'); },
            'n': function() { Cursor.go('new'); },
            'b': function() { Cursor.go('browse'); },
            's': function() { Cursor.go('saved'); },
            'r': function() { Cursor.go('recommended'); },
            't': function() { Cursor.go('stats'); }
        }
    }
}

SupportedSites['reddit.com/'] = RedditSource;