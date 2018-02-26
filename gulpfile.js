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
const runTimestamp = Math.round(Date.now() / 1000);

const SRC = './src/';
const PUBLIC = './public/';

gulp.task('font', function() {
  const fontName = 'icon';

  return gulp.src(SRC + 'iconfont/*.svg')
    .pipe(iconfont({
      fontName: fontName,
      timestamp: runTimestamp,
      fontHeight: 1001
    }))
    .on('codepoints', function(codepoints) {

      //順序制御用の番号を削除
      for (const i = 0; i < codepoints.length; i++) {
        codepoints[i]["name"] = codepoints[i]["name"].split('_')[1];
      }
      const options = {
        className: fontName,
        fontName: fontName,
        fontPath: '../fonts/',
        glyphs: codepoints
      };

      // CSS
      gulp.src(SRC + 'iconfont/template.css')
        .pipe(consolidate('lodash', options))
        .pipe(rename({
          basename: '_iconfont',
          extname: '.scss'
        }))
        .pipe(gulp.dest(SRC + 'scss/utility/'));

      // フォント一覧 HTML
      gulp.src(SRC + 'iconfont/template.html')
        .pipe(consolidate('lodash', options))
        .pipe(rename({
          basename: 'icon-sample'
        }))
        .pipe(gulp.dest(SRC + 'iconfont/'));
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
    port: 8080,
    ghostMode: false
  });
});

gulp.task('default', ['ejs', 'server', 'sass', 'font'], () => {
  gulp.watch([SRC + 'ejs/**/*.ejs'], ['ejs']);
  gulp.watch([SRC + 'scss/**/*.scss'], ['sass']);
  gulp.watch([SRC + 'iconfont/*'], ["font"]);
});
