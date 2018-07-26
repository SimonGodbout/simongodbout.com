const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const gulpif = require('gulp-if');
const argv = require('yargs').argv;
const browserSync = require('browser-sync').create();

const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');

const imageminPlugins = [
  //imagemin.jpegtran(),
  imageminPngquant(),
  imageminMozjpeg(),
  imagemin.gifsicle(),
];


// For sourcemaps
argv.b = argv.b || false

const modulesDir = './node_modules';
const mqDir = modulesDir + '/sass-mq';
const susyDir = modulesDir + '/susy/sass';
const normalizeDir = modulesDir + '/normalize-scss/sass';
const assetsDir = './web/app/themes/html5blank/assets';
const srcDir = assetsDir + '/src';
const sassDir = srcDir + '/sass';
const jsDir = srcDir + '/js';
const imageDir = [srcDir + '/images/**/*.gif', srcDir + '/images/**/*.jpeg', srcDir + '/images/**/*.jpg', srcDir + '/images/**/*.png', srcDir + '/images/**/*.svg'];

const distDir = assetsDir + '/dist';
const cssDir = distDir + '/css';
const jsMinDir = distDir + '/js';
const imageCompressDir = distDir + '/images/';

const postcssPlugins = [
  autoprefixer({
    browsers: [
      'last 4 versions',
      'ie 9'
    ]
  })
];

gulp.task('sass', function(){
  return gulp.src(sassDir + '/*.scss')
  .pipe(gulpif(!argv.b, sourcemaps.init()))
  .pipe(sassGlob())
  .pipe(sass({
    includePaths: [mqDir, susyDir, normalizeDir]
  }).on('error', onError))
  .pipe(postcss(postcssPlugins))
  .pipe(gulpif(!argv.b, sourcemaps.write('')))
  .pipe(gulp.dest(cssDir))
  .pipe(browserSync.stream({
    match: cssDir + '/*.css'
  }));
});

gulp.task('uglify', function () {
  return gulp.src(jsDir + '/*.js')
    .pipe(uglify()
    .on('error', onError))
    .pipe(gulp.dest(jsMinDir))
});

// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'uglify'], function () {
  browserSync.init({
    proxy: "simongodbout.com",
    notify: false,
    ghostMode: true
  });

  gulp.watch([sassDir + '/**/*.scss'], ['sass']);
  gulp.watch(jsDir, ['uglify']);
});

gulp.task('prebuild', ['uglify', 'sass']);

gulp.task('default', ['serve']);

gulp.task('compress', function () {

  gulp.src(imageDir)
    .pipe(imagemin(imageminPlugins))
    //.on('error', onError)
    .pipe(gulp.dest(imageCompressDir))
})

function onError(err) {
  console.log(err)
  this.emit('end')
}