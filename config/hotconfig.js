"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKET_NAME = '';
exports.AWS_ACCESS_KEY = '';
exports.AWS_SECRET_KEY = '';
exports.AWS_REGION = '';
exports.AWS_RETRIES = 0;

exports.OUTPUT_DIR = 'media/output';
exports.DEFAULT_ENCODE = {
    type: 'default',
    outputType: 'mp4',
    bitrates: [1100, 730, 365],
    segmentSize: 6,
    codec: 'x264'
};
exports.ENCODER_OPTIONS = {
    SEGMENT_DURATION: 6,
    OUTPUT_SINGLE_FILE: false,
    HLS_VERSION: 4
};
exports.HLS_DIR = '/hls';
exports.LOCAL_PATH = '/opt/encoder';
exports.BENTO_PATH = '/opt/bento4/bin';
exports.SIGNED_URLS = false;
exports.CLEANUP = false;
//# sourceMappingURL=config.js.map