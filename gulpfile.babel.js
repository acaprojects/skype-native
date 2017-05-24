import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import runSequence from 'run-sequence';
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
    nativeLibs: 'lib/native/win32/*.dll'
}

/**
 * Output a highlighted message.
 */
const warn = (message) => plugins.util.log(plugins.util.colors.yellow(message));

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
gulp.task('build:typescript', ['doc'], () => {
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
gulp.task('build', () =>
    runSequence(
        'lint',
        'clean',
        ['build:typescript', 'build:native']
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

gulp.task('default', ['build']);
