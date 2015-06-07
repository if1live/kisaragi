// Ŭnicode please
///<reference path="../app.d.ts"/>

if (typeof module !== 'undefined') {
    var sprintf = require('sprintf');
}

module kisaragi {
    class Logger {
        elemId: string;

        constructor() {
            this.elemId = "textarea-logger";
        }

        debug(message:string, ...optionalParams: any[]) {
            console.debug(message, ...optionalParams);
            var text = this.createText(message, ...optionalParams);
            this.printHtmlLogger(text);
        }

        info(message: string, ...optionalParams: any[]) {
            console.info(message, ...optionalParams);
            var text = this.createText(message, ...optionalParams);
            this.printHtmlLogger(text);
        }

        warn(message: string, ...optionalParams: any[]) {
            console.warn(message, ...optionalParams);
            var text = this.createText(message, ...optionalParams);
            this.printHtmlLogger(text);
        }

        error(message: string, ...optionalParams: any[]) {
            console.error(message, ...optionalParams);
            var text = this.createText(message, ...optionalParams);
            this.printHtmlLogger(text);
        }

        log(message: string, ...optionalParams: any[]) {
            console.log(message, ...optionalParams);
            var text = this.createText(message, ...optionalParams);
            this.printHtmlLogger(text);
        }

        printHtmlLogger(message: string) {
            if (typeof document === 'undefined') {
                return;
            }

            var el = document.getElementById(this.elemId);
            el.textContent = message + "\n" + el.textContent;
        }

        createText(message: string, ...optionalParams: any[]) {
            // message에 추가 정보 들어갈 경우 대비해서 분리
            var text = sprintf(message, ...optionalParams);
            return text;
        }
    }

    export var logger = new Logger();
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.logger = kisaragi.logger;
}

