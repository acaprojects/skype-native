import * as gulp from 'gulp';
import * as msbuild from 'gulp-msbuild';
import * as message from 'gulp-message';
import * as path from 'path';

const vsProject = './skype-native.sln';

const paths = {
    nativeLibs: 'lib/native/'
};

/**
 * Build the native C# project components.
 */
gulp.task('compile:native', () => {
    const build = () =>
        gulp.src(vsProject)
            .pipe(msbuild({
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
        message.warn('Unsupported build platform. Using prebuilt dll.');

    return process.platform === 'win32' ? build() : skip();
});
