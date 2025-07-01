const path = require('path');
const { task, src, dest } = require('gulp');

task('build:icons', copyIcons);
task('build:bundle', copyBundled);

function copyIcons() {
    const iconsSource = path.resolve('icons', '*.{png,svg}');
    const iconsDestination = path.resolve('dist', 'icons');

    return src(iconsSource).pipe(dest(iconsDestination));
}

function copyBundled() {
    const bundledSource = path.resolve('bundled', 'nats-bundled.js');
    const bundledDestination = path.resolve('dist', 'bundled');

    return src(bundledSource).pipe(dest(bundledDestination));
}