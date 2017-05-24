import gulp from 'gulp';
import ts from 'gulp-typescript';
import tslint from 'gulp-tslint';
import run from 'gulp-run';
import typedoc from 'gulp-typedoc';
import del from 'del';
import merge from 'merge2';
import { compilerOptions } from './tsconfig.json';
import { name } from './package.json';

const tsProject = ts.createProject('tsconfig.json');

const buildPaths = {
    dist: 'dist/',
    docs: 'docs/'
}

gulp.task('lint', () =>
    tsProject.src()
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report())
);

gulp.task('test', () =>
    run('npm test').exec()
);

gulp.task('clean', () =>
    del(Object.values(buildPaths))
);

gulp.task('build', ['clean', 'doc'], () => {
    const tsc = tsProject.src().pipe(tsProject());

    const toDist = stream => stream.pipe(gulp.dest(buildPaths.dist));

    const components = [
        tsc.js,
        tsc.dts
        // TODO move native dll's here too
    ]

    return merge(components.map(toDist));
});

gulp.task('doc', () =>
    tsProject.src()
        .pipe(typedoc({
            module: compilerOptions.module,
            target: compilerOptions.target,
            out: buildPaths.docs,
            name: name
        }))
);

gulp.task('default', ['lint', 'build']);
