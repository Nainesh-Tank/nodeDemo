var CryptoJS = require("crypto-js");
const crypto = require('crypto');
const jsencrypt = require('node-jsencrypt');
this.string_key = '|$%@5)+&^**9#_/*';
this.string_iv = '*+_6$0@#}%!!8+^@';

this.key = '|$%@5)+&^**9#_/*';
this.iv = '<?"0#%&>^$)280^9';
// this.key = process.env.Cripto_Key;
// this.iv = process.env.Cripto_iv;
this.app_key = '+T*&)*$_-(|\*$)%';
this.app_iv = '<?"0#%&>^$)280^9';

const Encryption = function (commom) {
    this.Device_Name = commom.Device_Name;
};

Encryption.encrypt = (str) => {
    try {
        var key = this.key;
        var iv = this.iv;
        var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(str), key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        return Buffer.from(encrypted.toString(), 'utf-8').toString('base64');
    }catch (e) {
        console.log("Something has gone wrong!", e);
        return false
    }
};

Encryption.decrypt = (encrypted) => {
    try {
        var key = this.key;
        var iv = this.iv;

        var decrypted = CryptoJS.AES.decrypt(Buffer.from(encrypted, 'base64').toString('utf-8'), key, {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }catch (e) {
        console.log("Something has gone wrong!", e);
        return false
    }
};

// Encryption.encryptResponse = (str) => {
//     const key = Buffer.from(this.string_key, 'utf-8');
//     const iv = Buffer.from(this.string_iv, 'utf-8');

//     const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
//     let encrypted = cipher.update(str, 'utf-8', 'hex');
//     encrypted += cipher.final('hex');

//     return encrypted;
// }

// Encryption.decryptResponse = (encrypted) => {
//     const key = Buffer.from(this.string_key, 'utf-8');
//     const iv = Buffer.from(this.string_iv, 'utf-8');
//     if(encrypted){
//         const splitbyCommaData = encrypted.split(",");
//         const decryptedString = splitbyCommaData.map(encryptedData => {
//             const splitData = encryptedData.split(" ");
//             const decryptedString = splitData.map(encryptedData => {
//                 if(encryptedData){
//                     const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
//                     let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
//                     decrypted += decipher.final('utf-8');
//                     return decrypted;
//                 }else{
//                     return '';
//                 }
//             });
//             return decryptedString.join(' ');
//         });  
//         return decryptedString.join(',');
//     }
//     return '';
// };

// caesar Cipher Encryption 
Encryption.encryptResponse = (encrypted) => {
    try {
        if(encrypted) {
            let key = 15;
            const shift = 3;   
            return encrypted
            .split('')
            .map(char => {
                if (char.match(/[a-zA-Z]/)) {
                    const charCode = char.charCodeAt(0);
                    const offset = charCode >= 65 && charCode <= 90 ? 65 : 97;
                    return String.fromCharCode((charCode - offset + shift + key) % 26 + offset);
                }
                return char;
            })
            .join('');
        }
        else {
            return '';
        }        
    } catch (error) {
        console.log("Something has gone wrong!", error);
        return false
    }
};

Encryption.decryptResponse = (encrypted) => {
    try {
        if(encrypted) {
            let key = 15;
            const shift = 3;
            return encrypted
            .split('')
            .map(char => {
                if (char.match(/[a-zA-Z]/)) {
                    const charCode = char.charCodeAt(0);
                    const offset = charCode >= 65 && charCode <= 90 ? 65 : 97;
                    return String.fromCharCode((charCode - offset - shift + 26 - key) % 26 + offset);
                }
                return char;
            })
            .join('');
        }
        else {
            return '';
        }
    } catch (error) {
        console.log("Something has gone wrong!", error);
        return false
    }
};

module.exports = Encryption;
