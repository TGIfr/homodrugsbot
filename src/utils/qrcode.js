const QRCode = require('easyqrcodejs-nodejs');


function generateQRCode(link){// Options
    let options = {
        text: link,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H,
        // dotScale: 0.1,
        //
        backgroundImage: __dirname + '\\homo.png', // Background Image
        backgroundImageAlpha: 1, // Background image transparency, value between 0 and 1. default is 1.
        autoColor: true,
    };

// New instance with options
    let qrcode = new QRCode(options);

// Save QRCode image
    qrcode.saveImage({
        path: __dirname + '\\q.png' // save path
    });
    return __dirname + '\\q.png'
}

module.exports = generateQRCode
