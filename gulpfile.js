'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// compile scss to css
gulp.task('sass', function () {
    return gulp.src('./sass/styles.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({basename: 'styles.min'}))
        .pipe(gulp.dest('./css'))
        .pipe(connect.reload());
});

// watch changes in scss files and run sass task
gulp.task('watch', function () {
    connect.server({
        root: './',
        port: 1234,
        livereload: true
    });
    // gulp.watch('./*.html', connect.reload());
    gulp.watch('./sass/**/*.scss', ['sass']);
    gulp.watch('./js/**/*.js', ['minify-js']);
});

// minify js
gulp.task('minify-js', function () {
    return gulp.src('./js/scripts.js')
        .pipe(uglify())
        .pipe(rename({basename: 'scripts.min'}))
        .pipe(gulp.dest('./js'))
        .pipe(connect.reload());
});

// default task
gulp.task('default', ['sass', 'minify-js']);
