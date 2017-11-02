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

export const LOCAL_PATH = ''
export const BENTO_PATH = ''

export const BUCKET_NAME = ''
export const SIGNED_URLS = false
export const CLEANUP = false

export const AWS_ACCESS_KEY = ''
export const AWS_SECRET_KEY = ''
export const AWS_REGION = ''
export const AWS_RETRIES = 0