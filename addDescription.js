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
/*var tempData;
try {
    var newData = require('./newData.json');
    var lastElement = require('./lastElement.json');
    var tempData = phpData;
    phpData = phpData.slice(lastElement.element);
    console.log('Starting old data scraping at element ' + lastElement.element);
} catch(e) {
    console.log('Starting new data scraping.');
}*/
var fs = require('fs');
var jquery = fs.readFileSync("./lib/jquery.js", "utf-8");
//var $ = require('jquery');
//var indexStore = [];
var t = new Stagger(phpData, 4000, function (index, phpItem, store) {
    if (!store) store = [];

	var url = phpItem.url + '?setbeta=1&beta=1';
	console.log(url);
	jsdom.env({url: url, src: [jquery], done: function (errors, window) {
		var $ = window.$;
		var description = $('.refsect1.description').children('.para').text();
		if(description !== '') {
			description = description.trim();
			if(phpItem.description === null) {
                phpItem.description = description;
            }
		}
        store[index] = phpItem;
        //indexStore.push(index);
        window.close();
	}});
}, function (store) {
    fs.writeFile('newData.json', JSON.stringify(store), function(error) {
        if(error) {
            console.log(error);
            process.exit(1);
        }
        console.log("File Saved.");
        process.exit(0);
    });
});
// Start stagger
t.start();
// Catch signal end trigger
/*process.on('SIGINT', function() {
    if(newData) {
        $.extend(phpData, tempData);
    }
    fs.writeFile('newData.json', JSON.stringify(phpData), function (error) {
        if(error) {
            console.log(error);
            process.exit(1);
        }
        fs.writeFile('lastElement.json', JSON.stringify({element: indexStore.pop()}), function (error) {
            if(error) {
                console.log(error);
                process.exit(1);
            }
            console.log("Files Saved.");
            process.exit(0);
        });
    });
});*/