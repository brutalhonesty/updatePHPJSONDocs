#!/usr/bin/node

//http://stackoverflow.com/a/16066300/1612721
var Stagger = function (data, stagger, fn, cb) {

    var self        = this;
    this.timerID    = 0;
    this.data       = [].concat(data);
    this.fn         = fn;
    this.cb         = cb;
    this.stagger    = stagger;
    this.iteration  = 0;
    this.store      = {};

    this.start = function () {
        (function __stagger() {
            
            self.fn(self.iteration, self.data[self.iteration], self.store);

            self.iteration++;

            if (self.iteration != self.data.length)
                self.timerID = setTimeout(__stagger, self.stagger);
            else
                cb(self.store);

        })();
    };

    this.stop = function () {
        clearTimeout(self.timerID);
        self.timerID = 0;
    };
};
var jsdom = require('jsdom');
var phpData = require('./data.php.json');
var fs = require('fs');
var jquery = fs.readFileSync("./lib/jquery.js", "utf-8");
var t = new Stagger(phpData, 4000, function (index, phpItem) {
	var url = phpItem.url + '?setbeta=1&beta=1';
	console.log(url);
	jsdom.env({url: url, src: [jquery], done: function (errors, window) {
		var $ = window.$;
		var description = $('.refsect1.description').children('.para').text();
		if(description !== '') {
			description = description.trim();
			phpItem.description = description;
		}
	}});
});
t.start();