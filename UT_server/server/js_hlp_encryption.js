"use strict";


/*
    Encrypt Account ID
*/
exports.hlp_encrypt = function (Key,text)
{
    return Key[3] + text.toString();
    
}


/*
    Decrypt Account ID
*/
exports.hlp_decrypt = function (Key,text)
{
    return text; //text.substr(1,text.length);
}