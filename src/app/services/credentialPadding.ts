import {PaddedCredentials} from "../../IsaacAppTypes";

export function utf8ByteLength(str: string) {
    // https://stackoverflow.com/a/23329386
    // Returns the byte length of an utf8 string.
    let s = str.length;
    for (let i=str.length-1; i>=0; i--) {
        let code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;
        else if (code > 0x7ff && code <= 0xffff) s+=2;
        if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
    }
    return s;
}

function paddingLengthRequired(bodyLength: number) {
    // Pad to the next power of two above the body size, but at least to 2^8 = 256 bytes:
    return Math.pow(2, Math.max(Math.ceil(Math.log(bodyLength)/Math.log(2)), 8)) - bodyLength;
}

function generatePadding(paddingLength: number) {
    return Array(paddingLength).fill(0).map(() => Math.random().toString(36).charAt(2)).join('');
}

export function securePadCredentials(credentials: {email: string; password: string}) {
    let paddedCredentials: PaddedCredentials = Object.assign({_randomPadding: ""}, credentials);
    let requestBodyByteLength = utf8ByteLength(JSON.stringify(paddedCredentials));
    let paddingLength = paddingLengthRequired(requestBodyByteLength);
    paddedCredentials._randomPadding = generatePadding(paddingLength);
    return paddedCredentials;
}

export function securePadPasswordReset(passwordResetParams: {password: string}) {
    let passwordResetData = {
        password: passwordResetParams.password,
        _randomPadding: ""
    };
    let requestBodyByteLength = utf8ByteLength(JSON.stringify(passwordResetData));
    let paddingLength = paddingLengthRequired(requestBodyByteLength);
    return Object.assign(passwordResetParams, {_randomPadding: generatePadding(paddingLength)});
}