function require(name) {
    if (name === 'underscore') {
        return window._;
    } else if (name == 'assert') {
        return window.assert;
    }
    throw ("unknown library : " + name);
    return null;
}