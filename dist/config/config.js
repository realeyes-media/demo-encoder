"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.LOCAL_PATH = '/Users/philmoss/Repos/demo-encoder';
exports.BUCKET_NAME = 'demo-encoder';
exports.SIGNED_URLS = false;
exports.CLEANUP = false;
exports.AWS_ACCESS_KEY = 'AKIAJN746OXAQJQFP6OQ';
exports.AWS_SECRET_KEY = '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';
exports.AWS_REGION = 'us-east-1';
exports.AWS_RETRIES = 0;
//# sourceMappingURL=config.js.map