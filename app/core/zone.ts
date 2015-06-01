// Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
    // zone idx is 32-bit
    // 11 + 11 (x, y) + 10 (z)
    // z = floor
    
    var BIT_WIDTH_X = 11;
    var BIT_WIDTH_Y = 11;
    var BIT_WIDTH_Z = 10;
    
    var BIT_SHIFT_X = (32 - BIT_WIDTH_X);
    var BIT_SHIFT_Y = (BIT_SHIFT_X - BIT_WIDTH_Y);
    var BIT_SHIFT_Z = (BIT_SHIFT_Y - BIT_WIDTH_Z);
    
    if(BIT_SHIFT_X != 21) { throw "invalid bit shift x"; }
    if(BIT_SHIFT_Y != 10) { throw "invalid bit shift y"; }
    if(BIT_SHIFT_Z != 0) { throw "invalid bit shift z"; }
        
    export class Zone {
        zoneIdx: number;

        constructor(zoneIdx: number) {
            this.zoneIdx = zoneIdx;
        }
        static buildIndex(x: number, y: number, z: number) {
            var idx = 0;
            idx += (x << BIT_SHIFT_X);
            idx += (y << BIT_SHIFT_Y);
            idx += (z << BIT_SHIFT_Z);
            return idx;
        }
        get zoneX(): number {
            var retval = this.zoneIdx >> BIT_SHIFT_X;
            return retval;
        }
        get zoneY(): number {
            var bitmask = 0;
            for(var i = BIT_WIDTH_Z ; i < BIT_WIDTH_Z + BIT_WIDTH_Y ; i += 1) {
                var mask = 1 << i;
                bitmask += mask;
            }
            
            var retval = this.zoneIdx & bitmask;
            retval = retval >> BIT_WIDTH_Z;
            return retval;
        }
        get zoneZ(): number {
            var bitmask = 0;
            for(var i = 0 ; i < BIT_WIDTH_Z ; i += 1) {
                var mask = 1 << i;
                bitmask += mask;
            }
            var retval = this.zoneIdx & bitmask;
            return retval;
        }
        get floor(): number {
            return this.zoneZ;
        }
    }
}

declare var exports: any;
if(typeof exports !== 'undefined') {
    exports.Zone = kisaragi.Zone;
}