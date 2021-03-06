'use strict';

var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var os = require('os');
var path = require('path');
var test = require('ava');

var runSequence = require('run-sequence').use(gulp);

var registerTasks = require('../../../lib/index').registerTasks;
var sitePath = path.join(__dirname, '../../fixture/sites/static-site');

var initCwd = process.cwd();
var tempDir = path.join(os.tmpdir(), 'soyweb');

test.cb.before(function(t) {
	gulp.src(path.join(sitePath, '**/*'))
		.pipe(gulp.dest(tempDir))
		.on('end', function() {
			process.chdir(tempDir);

			registerTasks({
				gulp: gulp
			});

			t.end();
		});
});

test.cb.after(function(t) {
	process.chdir(initCwd);

	del([path.join(tempDir, '**/*')], {
		force: true
	}).then(function() {
		t.end();
	});
});

test.cb('it should compile soyweb templates', function(t) {
	runSequence('front-matter', 'soyweb', function() {
		gulp.src('dist/**/*.html')
			.pipe(gutil.buffer(function(err, files) {
				t.is(path.relative(files[0].base, files[0].path), 'index.html');
				t.is(path.relative(files[1].base, files[1].path), 'child/index.html');
				t.is(files[0].contents.length, 553);
				t.is(files[1].contents.length, 652);

				t.end();
			}));
	});
});
