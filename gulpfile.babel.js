import gulp from 'gulp';
import ts from 'gulp-typescript';
import merge from 'merge2';

const tsProject = ts.createProject('tsconfig.json');

gulp.task("build", () => {
    const tsResult = tsProject.src()
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest("dist")),
        tsResult.js.pipe(gulp.dest("dist"))
    ]);
});

gulp.task('default', ['build']);