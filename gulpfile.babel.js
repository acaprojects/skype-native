import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import runSequence from 'run-sequence';
import path from 'path';
import del from 'del';
import merge from 'merge2';
import tsconfig from './tsconfig.json';
import npmconfig from './package.json';

const plugins = gulpLoadPlugins();

const tsProject = plugins.typescript.createProject('./tsconfig.json');

const vsProject = './skype-native.sln';

const paths = {
    dist: 'dist/',
    docs: 'docs/',
    nativeLibs: 'lib/native/'
}

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
        .pipe(plugins.tslint({
            formatter: 'verbose'
        }))
        .pipe(plugins.tslint.report())
);

/**
 * Run project unit tests.
 */
gulp.task('test', () =>
    plugins.run('npm test').exec()
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
gulp.task('build:typescript', () => {
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
            .pipe(plugins.msbuild({
                targets: ['Clean', 'Build'],
                configuration: 'Release',
                toolsVersion: 4.0,
                properties: {
                    OutDir: path.join(__dirname, paths.nativeLibs, 'win32')
                },
                errorOnFail: true,
                emitEndEvent: true,
                stdout: true,
                verbosity: 'minimal'
            }));

    const skip = () =>
        plugins.message.warn('Unsupported build platform. Using prebuilt dll.');

    return process.platform === 'win32' ? build() : skip();
});

/**
 * Run a full project build.
 */
gulp.task('build', () =>
    runSequence(
        ['lint', 'clean'],
        ['build:typescript', 'build:native'],
        'doc'
    )
);

/**
 * Render project documentation.
 */
gulp.task('doc', () =>
    tsProject.src()
        .pipe(plugins.typedoc({
            module: tsconfig.compilerOptions.module,
            target: tsconfig.compilerOptions.target,
            out: paths.docs,
            name: npmconfig.name
        }))
);

gulp.task('default', () =>
    runSequence(
        'build',
        'test'
    )
);
