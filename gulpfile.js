const gulp = require('gulp');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const ejs = require('gulp-ejs');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browser = require('browser-sync');
const reload = browser.reload;
const iconfont = require('gulp-iconfont');
const consolidate = require('gulp-consolidate');
const rename = require('gulp-rename');

const SRC = './src/';
const PUBLIC = './public/';

const runTimestamp = Math.round(Date.now() / 1000);
gulp.task('iconfonts', function() {
  return gulp.src(SRC + 'iconfont/*.svg')
    .pipe(iconfont({
      startUnicode: 0xF001,
      fontName: 'icon',
      formats: ['ttf', 'eot', 'woff', 'svg'],
      appendCodepoints: false,
      normalize: true,
      fontHeight: 500,
      timestamp: runTimestamp
    }))
    .on('glyphs', function(glyphs) {
      gulp.src(SRC + 'iconfont/_iconfont.scss')
        .pipe(consolidate('lodash', {
          glyphs: glyphs.map(function(glyph) {
            return {
              fileName: glyph.name,
              codePoint: glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase()
            };
          }),
          fontName: 'icon',
          fontPath: '../fonts/',
          cssClass: 'c-icon'
        }))
        .pipe(gulp.dest(SRC + 'scss/foundation/'));
    })
    .pipe(gulp.dest(PUBLIC + 'assets/fonts'));
});

gulp.task('sass', function() {
  return gulp.src(SRC + 'scss/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(PUBLIC + 'assets/css'))
    .pipe(browser.reload({
      stream: true
    }));
});

gulp.task('ejs', () => {
  gulp.src([
      SRC + 'ejs/**/*.ejs',
      '!' + SRC + 'ejs/**/_*.ejs' //除外ファイル
    ])
    .pipe(plumber())
    //gulp-ejs 2.0.0よりextの記載が必要（記載しないと元々の拡張子でコンパイルされる）
    .pipe(ejs({}, {}, {
      'ext': '.html'
    }))
    .pipe(gulp.dest(PUBLIC))
    .pipe(browser.reload({
      stream: true
    }));
});

gulp.task('server', () => {
  browser.init(null, {
    server: {
      baseDir: PUBLIC
    },
    notify: false,
    open: 'external',
    port: 34019,
    ghostMode: false
  });
});

gulp.task('default', ['ejs', 'server', 'sass'], () => {
  gulp.watch([SRC + 'ejs/**/*.ejs'], ['ejs']);
  gulp.watch([SRC + 'scss/**/*.scss'], ['sass']);
});
