var express    = require('express');
var bodyParser = require('body-parser');
var sjcl       = require('sjcl');

var HOST = process.env.HOST || '127.0.0.1'
var PORT = process.env.PORT || 8088

var app = express();
app.use(bodyParser.json());

var encryptMessage = function(message, encryptingKey) {
  var key = sjcl.codec.base64.toBits(encryptingKey);
  return sjcl.encrypt(key, message, {
    ks: 128,
    iter: 1,
  });
};

var decryptMessage = function(cyphertextJson, encryptingKey) {
    var key = sjcl.codec.base64.toBits(encryptingKey);
    return sjcl.decrypt(key, cyphertextJson);
};


// message: Plain text to encrypt
// key: base64 encoded key
app.post('/encrypt', function (req, res) {
    var body = req.body;
    try {
        if (body.message == null) { throw new Error("message is required"); }
        if (body.key == null) { throw new Error("key is required"); }
        var encrypted = encryptMessage(body.message, body.key);
        res.json({result: encrypted})
    } catch (e) {
        res.status(500)
        res.json({success: true, message: (e.name ? e.name : 'Error') + ': ' + e.message, errors: [e.message]})
    }
});

// message: JSON string of the encrypted message
// key: base64 encoded key
app.post('/decrypt', function (req, res) {
    var body = req.body;
    try {
        if (body.message == null) { throw new Error("message is required"); }
        if (body.key == null) { throw new Error("key is required"); }
        var encrypted = encryptMessage(body.message, body.key);
        var decrypted = decryptMessage(body.message, body.key);
        res.json({success: true, result: decrypted})
    } catch (e) {
        res.status(500)
        res.json({success: false, message: (e.name ? e.name : 'Error') + ': ' + e.message, errors: [e.message]})
    }

});



var server = app.listen(PORT, HOST);
server.on('listening', function() {
    console.log('Server listening on '+HOST+':'+PORT);
})

