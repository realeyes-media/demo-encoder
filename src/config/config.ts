export const OUTPUT_DIR = 'media/output'
export const DEFAULT_ENCODE = {
    type: 'default',
    outputType: 'mp4',
    bitrates: [1100, 730, 365],
    segmentSize: 6,
    codec: 'x264'
}

export const ENCODER_OPTIONS = {
    SEGMENT_DURATION: 6,
    OUTPUT_SINGLE_FILE: false,
    HLS_VERSION: 4
}

export const HLS_DIR = '/hls'

export const LOCAL_PATH = '/Users/philmoss/Repos/demo-encoder'

export const BUCKET_NAME = 'demo-encoder'
export const SIGNED_URLS = false
export const CLEANUP = false

export const AWS_ACCESS_KEY = 'AKIAJN746OXAQJQFP6OQ'
export const AWS_SECRET_KEY = '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'
export const AWS_REGION = 'us-east-1'
export const AWS_RETRIES = 0