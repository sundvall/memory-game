/*global require, module, KF04RZ211_CORE, process*/
/*jslint browser: false, devel:true */

//required
var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync'),
	browserify = require('browserify'),
	del = require('del'),
	fs = require("fs"),
	reload = browserSync.reload,
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	// plumber = require('gulp-plumber'),
	rename = require('gulp-rename'),
	source = require('vinyl-source-stream'),
	sass = require('gulp-sass');
// unitTest = require("./tasks/unit_test");

////////////////////////////////////////////////////////////////////////////
//scripts tasks
////////////////////////////////////////////////////////////////////////////

function build(dir, out) {
	'use strict';
	var outDir = out || 'bin';
	browserify({
		entries: ["./app/src/" + dir + "/index.js"]
	}).bundle()
	// .transform(babel.configure({loose: ["es6.classes"]})).bundle()
	// .pipe(uglify())
	// .pipe(rename('bundle.min.js'))
	// .pipe(plumber())
	.pipe(source(dir + ".js"))
		.pipe(gulp.dest("./dist/" + outDir))
		.pipe(reload({
			stream: true
		}));
	// .pipe(browserSync.stream());
}

function pack(dir, file) {
	'use strict';
	var path = './app/src/' + dir + '/mock/' + file + '.js';
	return gulp.src([path])
		.pipe(concat('adsparam.js'))
		.pipe(gulp.dest('./dist/bin/'));
}

gulp.task('common', function () {
	return build('common');
});

gulp.task('game', function () {
	return build('game');
});
/*package dom-integration tests*/
gulp.task('dom_tests', function () {
	return gulp.src(['./app/src/**/*_domtest.js'])
		.pipe(concat('domtest.js'))
		.pipe(gulp.dest("./dist/bin/"));
});

gulp.task('scripts', ['common', 'game']);

////////////////////////////////////////////////////////////////////////////
//css tasks
////////////////////////////////////////////////////////////////////////////
gulp.task('css:sass', function () {
	gulp.src('app/scss/**/*.scss')
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(sass({
			// outputStyle: 'compressed'
			outputStyle: 'expanded'
		}))
		.pipe(autoprefixer({
			browsers: ['last 20 versions'],
			cascade: true,
			remove: true
		}))
		.pipe(rename('game.css'))
		.pipe(gulp.dest('dist/css'))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('css', ['css:sass']);

////////////////////////////////////////////////////////////////////////////
//html tasks
////////////////////////////////////////////////////////////////////////////
gulp.task('html:copy_index_to_dist', function () {
	return gulp.src(['app/html/index.html'])
		.pipe(gulp.dest('./dist/'));
});
gulp.task('html', ['html:copy_index_to_dist'], function () {
	gulp.src(['app/**/*.html'])
		.pipe(reload({
			stream: true
		}));
});

////////////////////////////////////////////////////////////////////////////
//Browser-sync tasks
////////////////////////////////////////////////////////////////////////////
gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: "./dist/"
		}
	});
});

//run build server for test final app
gulp.task('build:serve', function () {
	browserSync({
		server: {
			baseDir: currentPath
		}
	});
});

////////////////////////////////////////////////////////////////////////////
//watch task
////////////////////////////////////////////////////////////////////////////
gulp.task('watch', function () {
	gulp.watch('app/src/**/*_domtest.js', ['dom_tests']);
	gulp.watch('app/src/**/*.js', ['scripts']);
	gulp.watch('app/**/*.html', ['html']);
	gulp.watch('app/scss/**/*.scss', ['css']);
});

////////////////////////////////////////////////////////////////////////////
//Build tasks
////////////////////////////////////////////////////////////////////////////

var versionName = 'vid_' + dateToString(),
	currentPath = 'versions/' + versionName;

function twoDigitString(num) {
	return (num < 10 ? ('0' + num) : ('' + num));
}

function dateToString(date) {
	/*convert a date to YEAR_MONTH_DATE_HOURMINUTE, ex:2015_03_14_1044*/
	var d = (date || new Date()),
		str,
		dateAsTwoDigit = twoDigitString(d.getDate()),
		month = twoDigitString(d.getMonth() + 1),
		hours = twoDigitString(d.getHours()),
		minutes = twoDigitString(d.getMinutes());
	str = d.getFullYear() + '_' + month + '_' + dateAsTwoDigit + '_' + hours + minutes;
	return str;
}

function writeToFile(outputFileName, outputText) {
	fs.writeFile(outputFileName, outputText, function (err) {
		if (err) {
			return;
		}
	});
}

function versionToJs(str) {
	var verVid = 'var KF04RZ211_version_vid = "' + str + '";',
		verCom = 'var KF04RZ211_version_common = "' + str + '";',
		verCss = '/*version:' + str + '*/';
	writeToFile(currentPath + '/bin/ver_vid.js', verVid);
	writeToFile(currentPath + '/bin/ver_com.js', verCom);
	writeToFile(currentPath + '/css/ver_css.css', verCss);
}

gulp.task('build:copy', function (cb) {
	/*copy dist folder into versions/vid_YYYY_MM_DD_HRMN/folder*/
	return gulp.src('./dist/**/*/')
		.pipe(gulp.dest(currentPath), cb);
});

gulp.task('build:createVersionFiles', ['build:copy'], function () {
	return versionToJs(versionName);
});

gulp.task('build:addversion', ['build:createVersionFiles'], function (cb) {
	gulp.src([currentPath + '/bin/ver_com.js', currentPath + '/bin/common.js'])
		.pipe(concat('common.js'))
		.pipe(gulp.dest(currentPath + '/bin/'));

	gulp.src([currentPath + '/bin/ver_vid.js', currentPath + '/bin/game.js'])
		.pipe(concat('game.js'))
		.pipe(gulp.dest(currentPath + '/bin/'));

	gulp.src([currentPath + '/css/ver_css.css', currentPath + '/css/game.css'])
		.pipe(concat('game.css'))
		.pipe(gulp.dest(currentPath + '/css/'));

	del([currentPath + '/bin/ver_com.js']);
	del([currentPath + '/bin/ver_vid.js']);
	del([currentPath + '/css/ver_css.css'], cb);
});

gulp.task('build:clearversionfiles', ['build:addversion'], function () {
	del([currentPath + '/bin/ver_com.js', currentPath + '/bin/ver_vid.js', currentPath + '/css/ver_css.css']);
});

gulp.task('build', ['build:copy', 'build:createVersionFiles', 'build:addversion', 'build:serve']);

////////////////////////////////////////////////////////////////////////////
//default task and break condition
////////////////////////////////////////////////////////////////////////////
gulp.on('err', function (err) {
	process.exit(err);
});

gulp.task('default', ['dom_tests', 'scripts', 'css', 'html', 'browser-sync', 'watch']);
