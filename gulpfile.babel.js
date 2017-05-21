import gulp from 'gulp';
import ts from 'gulp-typescript';
import tslint from 'gulp-tslint';
import run from 'gulp-run';
import del from 'del';
import merge from 'merge2';

const tsProject = ts.createProject('tsconfig.json');

const paths = {
    allSrcTs: 'src/**/*.ts',
    distDir: 'dist/'
}

gulp.task('lint', () =>
    gulp.src(paths.allSrcTs)
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report())
);

gulp.task('test', () =>
    run('npm test').exec()
);

gulp.task('clean', () =>
    del([paths.distDir])
);

gulp.task('build', ['clean'], () => {
    const tsResult = tsProject.src()
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest(paths.distDir)),
        tsResult.js.pipe(gulp.dest(paths.distDir))
    ]);
});

gulp.task('default', ['lint', 'build']);
