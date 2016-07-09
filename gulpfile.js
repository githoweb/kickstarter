var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var cssnano = require('gulp-cssnano');
var rename = require("gulp-rename");
var imagemin = require('gulp-imagemin');
var uncss = require('gulp-uncss');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var debug = require('gulp-debug');
var size = require('gulp-size');
var gulpif = require('gulp-if');
var args = require('yargs').argv;
var filenames = require("gulp-filenames");
var spritesmith = require('gulp.spritesmith');
var merge = require('merge-stream');



//=================================
// Tasks
//=================================
var condition = args.nocssnano ? true : false;

gulp.task('default', function() {
  // place code for your default task here
  console.log('toto');
});

gulp.task('sass', function () {
  return gulp.src('app/sass/*.scss')
    .pipe(debug({title: 'gulp-debug:'}))
    .pipe(size('showFiles'))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
			browsers: ['last 4 versions', 'IE 9', 'IE 10'],
			cascade: false
		}))

    .pipe(gulpif(
      condition,
      cssnano(), rename({suffix :'.min'})
    ))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/skin'));
});

gulp.task('sass:watch', function () {
  gulp.watch('app/sass/*.scss', ['sass']);
});

gulp.task('sassreturn', function () {
  return gulp.src('app/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
			browsers: ['last 4 versions', 'IE 9', 'IE 10', 'IE 11'],
			cascade: false
		}))
    .pipe(gulp.dest('app/cssfromsass'));
});


gulp.task('imgmin', () =>
	gulp.src('src/images/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/images'))
);

// to check if there are some unused css
gulp.task('uncss', function () {
    return gulp.src('site.css')
        .pipe(uncss({
            html: ['index.html', 'posts/**/*.html', 'http://example.com']
        }))
        .pipe(gulp.dest('./out'));
});


gulp.task('concatscripts', function() {
  return gulp.src(['./lib/file3.js', './lib/file1.js', './lib/file2.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'));
});

// gulp-clean-css
gulp.task('minify-css', function() {
  return gulp.src('styles/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist'));
});


gulp.src("app/template/*.html")
	.pipe(filenames("layouts"))
	.pipe(gulp.dest("./dist"));

//console.log (filenames.get("layouts")) // ["a.coffee","b.coffee"]
                              // Do Something With it


gulp.task('sprite', function () {
  var spriteData = gulp.src('app/img/src/*.png')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      imgPath: '../../img/sprite.png',
      cssName: 'sprite.css',
      padding: 2,
      //cssFormat: 'scss'
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
    .pipe(gulp.dest('app/img'));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
    .pipe(gulp.dest('app/sass/spritesmith/'));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);
});



gulp.task('sassSpriteResp', function generateSass () {
  gulp.src('app/sass/spritesmith/index.scss')
    .pipe(sass())
    .pipe(gulp.dest('app/sass/spritesmith/'));
});

gulp.task('spriteResp', function generateSpritesheets () {
  // Use all normal and `-2x` (retina) images as `src`
  //   e.g. `github.png`, `github-2x.png`
  var spriteData = gulp.src('app/img/src/*.png')
    .pipe(spritesmith({
      // Filter out `-2x` (retina) images to separate spritesheet
      //   e.g. `github-2x.png`, `twitter-2x.png`
      retinaSrcFilter: 'app/img/src/*@2x.png',

      // Generate a normal and a `-2x` (retina) spritesheet
      imgName: 'spritesheet.png',
      retinaImgName: 'spritesheet@2x.png',

      imgPath: '../../img/spritesheet.png',
      retinaImgPath: '../../img/spritesheet@2x.png',

      // Ne fonctionne pas avec le padding.
      padding: 2,

      // Generate SCSS variables/mixins for both spritesheets
      cssName: 'sprites.scss'
    }));

  // Deliver spritesheets to `dist/` folder as they are completed
  spriteData.img.pipe(gulp.dest('app/img/'));

  // Deliver CSS to `./` to be imported by `index.scss`
  spriteData.css.pipe(gulp.dest('app/sass/spritesmith/'));
});
