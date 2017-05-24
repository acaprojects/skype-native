import gulp from 'gulp';
import util from 'gulp-util'
import ts from 'gulp-typescript';
import tslint from 'gulp-tslint';
import run from 'gulp-run';
import typedoc from 'gulp-typedoc';
import msbuild from 'gulp-msbuild';
import del from 'del';
import merge from 'merge2';
import { compilerOptions } from './tsconfig.json';
import { name } from './package.json';

const tsProject = ts.createProject('tsconfig.json');

const vsProject = './skype-native.sln';

const paths = {
    dist: 'dist/',
    docs: 'docs/',
    nativeLibs: 'lib/native/win32/*.dll'
}

/**
 * Output a highlighted message.
 */
const warn = (message) => util.log(util.colors.yellow(message));

/**
 * Pipe a set of streams out to our dist directory and merge the result.
 */
const pipeToDist = (streams) => {
    const toDist = stream => stream.pipe(gulp.dest(paths.dist));
    return merge(streams.map(toDist));
}

/**
 * Lint all typescript source.
 */
gulp.task('lint', () =>
    tsProject.src()
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report())
);

/**
 * Run project unit tests.
 */
gulp.task('test', () =>
    run('npm test').exec()
);

/**
 * Nuke any output from anything constructer by build / doc scripts below.
 */
gulp.task('clean', () =>
    del([
        paths.dist,
        paths.docs
    ])
);

/**
 * Transpile the Typescript project components into something Node friendly.
 */
gulp.task('build:typescript', ['clean', 'doc'], () => {
    const tsc = tsProject.src().pipe(tsProject());

    return pipeToDist([
        tsc.js,
        tsc.dts
    ]);
});

/**
 * Build the native C# project components.
 */
gulp.task('build:native', () => {
    const build = () =>
        gulp.src(vsProject)
            .pipe(msbuild({
                targets: ['Clean', 'Build'],
                errorOnFail: true,
                toolsVersion: 4.0
            }));

    const skip = () =>
        warn('Unsupported build platform for native libs. Skipping...');

    process.platform === 'win32' ? build() : skip();

    return pipeToDist([
        gulp.src(paths.nativeLibs)
    ]);
});

/**
 * Run a full project build.
 */
gulp.task('build', ['build:typescript', 'build:native']);

/**
 * Render project documentation.
 */
gulp.task('doc', () =>
    tsProject.src()
        .pipe(typedoc({
            module: compilerOptions.module,
            target: compilerOptions.target,
            out: paths.docs,
            name: name
        }))
);

gulp.task('default', ['lint', 'build']);
