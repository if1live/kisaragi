/**
 * @fileoverview TSM - A TypeScript vector and matrix math library
 * @author Matthias Ferch
 * @version 0.6
 */
///<reference path='./vec2.ts' />
///<reference path='./vec3.ts' />
///<reference path='./vec4.ts' />
///<reference path='./mat2.ts' />
///<reference path='./mat3.ts' />
///<reference path='./mat4.ts' />
///<reference path='./quat.ts' />
if (typeof exports !== 'undefined') {
    exports.vec2 = kisaragi.vec2;
    exports.vec3 = kisaragi.vec3;
    exports.vec4 = kisaragi.vec4;
    exports.mat2 = kisaragi.mat2;
    exports.mat3 = kisaragi.mat3;
    exports.mat4 = kisaragi.mat4;
    exports.quat = kisaragi.quat;
}
