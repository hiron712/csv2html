const gulp = require('gulp');
const postcss = require("gulp-postcss");
const autoprefixer = require('autoprefixer');

const stylus = require('gulp-stylus');

const rename = require('gulp-rename');

const ejs = require("gulp-ejs");

const fs = require('fs');
const csv = require('csv-parser');

/*-------------------------------------------------
--------------------------------------------------*/
gulp.task('stylus', function() {
    return gulp.src(['resources/stylus/**/*.styl','!resources/stylus/**/_*.styl'])
        .pipe(stylus({
            compress: true
        }))
        .pipe(postcss([
            autoprefixer({
                cascade: false
            })
        ]))
        .pipe(gulp.dest('htdocs/assets/css/'));
});

/*-------------------------------------------------
--------------------------------------------------*/
gulp.task( "ejs", function () {
    let json;
    const results = [];

    return fs.createReadStream(__dirname + '/resources/tourism_od2810.csv')
        .pipe(csv())
        .on('data', function(data){
            let zip = data['郵便番号'];
            data['郵便番号'] = zip.substr(1,3) + '-' + zip.substr(4,4);

            let cat = data['カテゴリ'];
            data['カテゴリ'] = cat.substr(1,4);
            results.push(data);
        })
        .on('end', function(){
            json = {
                item : results
            };
            gulp.src(["./resources/ejs/index.ejs"])
                .pipe(ejs(json))
                .pipe(rename(
                    {
                        extname: '.html'
                    }))
                .pipe( gulp.dest( "./htdocs" ) );

            ////////////////////////
            for(let prop in results){
                json = {
                    item : results[prop]
                };
                gulp.src(["./resources/ejs/place.ejs"])
                .pipe(ejs(json))
                .pipe(rename(
                    { 
                        basename: 'place' + prop, 
                        extname: '.html' 
                    }))
                .pipe( gulp.dest( "./htdocs" ) );
    
            }
        });
});
/*-------------------------------------------------
--------------------------------------------------*/
gulp.task('watch', function(){
    gulp.watch( 'resources/sass/**/*.scss', gulp.task('scss'));
    gulp.watch( 'resources/stylus/**/*.styl', gulp.task('stylus'));
    gulp.watch( 'resources/ejs/**/*.ejs', gulp.task('ejs'));
});
