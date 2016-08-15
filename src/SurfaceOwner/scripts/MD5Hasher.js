//---------------------------------------------------------------------
// <copyright file="MD5Hasher.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary> This class uses md5 algorithm to hash strings
// </summary>
//---------------------------------------------------------------------
var MD5Hasher = (function () {
    function MD5Hasher() {
    }
    MD5Hasher.prototype.RotateLeft = function (lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };
    MD5Hasher.prototype.AddUnsigned = function (lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            }
            else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        }
        else {
            return (lResult ^ lX8 ^ lY8);
        }
    };
    MD5Hasher.prototype.F = function (x, y, z) {
        return (x & y) | ((~x) & z);
    };
    MD5Hasher.prototype.G = function (x, y, z) {
        return (x & z) | (y & (~z));
    };
    MD5Hasher.prototype.H = function (x, y, z) {
        return (x ^ y ^ z);
    };
    MD5Hasher.prototype.I = function (x, y, z) {
        return (y ^ (x | (~z)));
    };
    MD5Hasher.prototype.FF = function (a, b, c, d, x, s, ac) {
        var self = this;
        a = self.AddUnsigned(a, self.AddUnsigned(self.AddUnsigned(self.F(b, c, d), x), ac));
        return self.AddUnsigned(self.RotateLeft(a, s), b);
    };
    MD5Hasher.prototype.GG = function (a, b, c, d, x, s, ac) {
        var self = this;
        a = self.AddUnsigned(a, self.AddUnsigned(self.AddUnsigned(self.G(b, c, d), x), ac));
        return self.AddUnsigned(self.RotateLeft(a, s), b);
    };
    MD5Hasher.prototype.HH = function (a, b, c, d, x, s, ac) {
        var self = this;
        a = self.AddUnsigned(a, self.AddUnsigned(self.AddUnsigned(self.H(b, c, d), x), ac));
        return self.AddUnsigned(self.RotateLeft(a, s), b);
    };
    MD5Hasher.prototype.II = function (a, b, c, d, x, s, ac) {
        var self = this;
        a = self.AddUnsigned(a, self.AddUnsigned(self.AddUnsigned(self.I(b, c, d), x), ac));
        return self.AddUnsigned(self.RotateLeft(a, s), b);
    };
    MD5Hasher.prototype.WordToHex = function (lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    };
    MD5Hasher.prototype.Utf8Encode = function (inputString) {
        inputString = inputString.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < inputString.length; n++) {
            var c = inputString.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    ;
    MD5Hasher.prototype.ConvertToWordArray = function (string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };
    MD5Hasher.prototype.Hash = function (inputString) {
        var self = this;
        var x = Array();
        var k, AA, BB, CC, DD, a, b, c, d;
        var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
        inputString = self.Utf8Encode(inputString);
        x = self.ConvertToWordArray(inputString);
        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;
        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = self.FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = self.FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = self.FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = self.FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = self.FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = self.FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = self.FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = self.FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = self.FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = self.FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = self.FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = self.FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = self.FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = self.FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = self.FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = self.FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = self.GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = self.GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = self.GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = self.GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = self.GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = self.GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = self.GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = self.GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = self.GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = self.GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = self.GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = self.GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = self.GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = self.GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = self.GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = self.GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = self.HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = self.HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = self.HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = self.HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = self.HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = self.HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = self.HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = self.HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = self.HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = self.HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = self.HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = self.HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = self.HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = self.HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = self.HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = self.HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = self.II(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = self.II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = self.II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = self.II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = self.II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = self.II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = self.II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = self.II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = self.II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = self.II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = self.II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = self.II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = self.II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = self.II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = self.II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = self.II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = self.AddUnsigned(a, AA);
            b = self.AddUnsigned(b, BB);
            c = self.AddUnsigned(c, CC);
            d = self.AddUnsigned(d, DD);
        }
        var temp = self.WordToHex(a) + self.WordToHex(b) + self.WordToHex(c) + self.WordToHex(d);
        return temp.toLowerCase();
    };
    return MD5Hasher;
})();
//# sourceMappingURL=MD5Hasher.js.map