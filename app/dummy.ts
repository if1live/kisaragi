//declare module kisaragi {
module kisaragi {
    export class Foo {
        bar() {
            console.log('1234');
        }
    };
}

declare var exports: any;
if (typeof exports != 'undefined') {
    exports.Foo = kisaragi.Foo;
}