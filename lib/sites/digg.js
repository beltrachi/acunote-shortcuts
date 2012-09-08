/*
 *  ===========================================================
 *  Shortcuts Library: Digg Support
 *  Copyright (c) 2008 Pluron, Inc.
 *  ===========================================================
 */
function DiggSource() {
    var CursorImageData = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%09%00%00%00%0B%08%06%00%00%00%ADY%A7%1B%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0D%3A%00%00%0D%3A%01%03%22%1E%85%00%00%00%07tIME%07%D6%0B%10%090%06%16%8E%9BU%00%00%00%1DtEXtComment%00Created%20with%20The%20GIMP%EFd%25n%00%00%00PIDAT%18%D3%8D%D0%A1%0E%C0%20%0C%84%E1%BF%E7%B0(%DE%FF%E9PXd%A7XH%B7%95%9Dl%BE%E6%9A%1A%E0l%E9c%1A!%8A%C3V%8B%3F%D0%DBv%84%FA%AA%D9%A1%B2%7B%16%14%87%B4Z%FC%88%FA%98%A6%EC%E0U%AF%13%B8Q%06%00%EC%CF%C7%2F%C8T'%AFF%81S%0A%00%00%00%00IEND%AEB%60%82"

    var CursorStyles = 
        '#shortcut_status { background: #f00;color: #fff;padding: 5px;position: absolute;top: 10px;right: 10px;}\n'+
        '.cursor {position:absolute; margin-top: 5px; margin-left: 55px;}\n' + 
        '.news-body {padding-left: 70px;}\n' +
        'span.news-img {left: 70px;}';
    ;


    var CursorHelp =
        '=== Cursor Movement ===\n' +
        'j - move cursor up\n' +
        'k - move cursor down\n' +
        '\n=== Post Management ===\n' +
        'o, <Enter> - open original post\n'+
        'i - open comments\n' +
        'u - back to news list\n' +
        '\n=== Voting ===\n' +
        'd, v u - vote up ("digg it")\n' +
        '\n=== Other ===\n' +
        '? - this help\n';


    var Cursor = {

        cursors: 0,
        current: -1,
        buried: [],

        init: function() {
            if (!document.getElementById('sub-nav')) {
                this.addStyles(CursorStyles);
                var table = document.getElementById('wrapper');
                if (!table) return false;
                var rows = table.getElementsByTagName('div');
                if (rows.length == 0) return false;
                var j = 0;
                for(var i=0; i<rows.length;i++) {
                    var row = rows[i];
                    var rowId = row.getAttribute('id');
                    if (rowId && rowId.match('enclosure')) {
                        // Create cursor
                        var img = document.createElement('img');
                        img.className = "cursor";
                        img.src = CursorImageData;
                        img.style.display = 'none';
                        img.setAttribute('id', 'cursor_'+j);
                        row.insertBefore(img, row.firstChild);
                        j++;
                    }
                }
                this.cursors = j;
                this.current = 0;
                this.showCursor(this.current);
            }
            shortcutListener.init();
        },

        isBuried: function(index) {
            for (var i=0;i<this.buried.length;i++) {
                if (index == this.buried[i]) return true;
            }
            return false;
        },

        next: function() {
            var i = this.current + 1;
            if (i >= this.cursors) {
                this.goPage('next');
            }
            if (this.isBuried(i)) {
                this.showCursor(i);
                this.next();
                return;
            }
            this.showCursor(i);
        },

        previous: function() {
            var i = this.current - 1;
            if (i < 0) {
                this.goPage('previous');
            };    
            if (this.isBuried(i)) {
                this.showCursor(i);
                this.previous();
                return;
            }
            this.showCursor(i);
        },

        showCursor: function(i) {
            if (i<0) return false;
            this.hideCursor(this.current);
            var c = document.getElementById('cursor_'+i);
            if (!c) return false;
            c.style.display = '';
            this.current = i;

            var offset = window.pageYOffset;
            var innerHeight = window.innerHeight;
            var cursorPos = this.findPosY(c);
            if ( (cursorPos < (offset + 30)) || (cursorPos > (offset+innerHeight-30))) {
                window.scrollTo(0, cursorPos - (innerHeight/2))
            }

            // Move focus to post link
            var a  = this.getPostLink(i);
            if (a) a.focus();
        },

        hideCursor: function(i) {
            var c = document.getElementById('cursor_'+i);
            if (!c) return false;
            c.style.display = 'none';
        },

        getPostLink: function(i) {
            // Due to error in digg's layout we get should get heading this funny way
            var elem = document.getElementById('enclosure'+i);
            if (!elem) return false;
            var h3s = elem.getElementsByTagName('h3');
            if (!h3s) return false;
            var h3 = h3s[0];
            return h3.getElementsByTagName('a')[0];
        },

        getToolLink: function(i, className) {
            var elem = document.getElementById('enclosure'+i);
            if (!elem) return null;
            var links = elem.getElementsByTagName('a');
            for(var i=0; i<links.length; i++) {
                if (links[i].className.match(className)) {
                    return links[i];
                }
            }
            return null;
        },

        jump: function(where) {
            var a = null;
            if (where == 'post') {
                a = this.getPostLink(this.current);
            } else if (where == 'comments') {
                a = this.getToolLink(this.current, 'comments');
            } else {
                return false;
            }
            if (a) location.href = a.getAttribute('href');
        },

        goPage: function(where) {
            var href = location.href;
            var matches = location.href.match(/page(\d+)$/);
            if (!matches) {
                if (where == 'next') {
                location.href = '/page2';
                } else {
                return false;
                }
            } else {
                var pageNum = parseInt(matches[1]);
                if (where == 'next') {
                    pageNum++;
                } else {
                    pageNum--;
                }
                if (pageNum==1) {
                    location.href='/';
                } else {
                    location.href='/page'+pageNum;
                }
            } 
        },

        digg: function() {
            if (!this.isLoggedIn()) {
                poppd(this.current);
            } else {
                var li = document.getElementById('diglink'+this.current);
                var a = li.getElementsByTagName('a')[0];
                if (!a) return false;
                var href = a.getAttribute('href');
                var code = href.substring(11);
                eval(code);
            };
        },

        bury: function() {
            if (!this.isLoggedIn()) {
                poppr(this.current);
            } else {
                var div = document.getElementById('burytool'+this.current);
                if (!div) return false;
                var diglink = document.getElementById('diglink'+this.current);
                if (diglink && (diglink.className == 'buried-it')) {
                    return false;
                }
                var a = div.getElementsByTagName('a')[0];
                var href = a.getAttribute('href');
                var code = href.substring(11);
                eval(code);
                this.buried.push(this.current);
                this.next();
            };
        },

        isLoggedIn: function() {
            return document.getElementById('section-profile');
        },

        back: function() {
            if (document.getElementById('sub-nav')) history.back();
        },

        help: function() {
            alert(CursorHelp);
        },

        findPosY: function (obj) {
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

        findPosX: function (obj) {
            if (!obj) return 0;
            var curleft = 0;
            if (obj.offsetParent) {
                curleft = obj.offsetLeft;
                while (obj = obj.offsetParent) {
                    curleft += obj.offsetLeft;
                }
            }
            return curleft;
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

        'j': function() { Cursor.next();},
        'k': function() { Cursor.previous();},
        'd': function() { Cursor.digg();},
        'o': function() { Cursor.jump('post');},

        'i': function() { Cursor.jump('comments');},
        'u': function() { Cursor.back();},

        'v': {
            'u': function() { Cursor.digg();},
            'd': function() { Cursor.bury();}
        }

    }
}
