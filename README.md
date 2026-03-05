# compresso

browser-based video compression. drop a video, pick a codec and quality level, get a smaller file back. nothing leaves your device.

ffmpeg.wasm runs the compression directly in the browser using webassembly, so there is no server involved, no upload required, and no account needed. once loaded, it works offline.

## what it does

- compress video to h.264, h.265, av1, or vp9
- one-click presets for web, social media, discord, and 4k archiving
- custom crf and bitrate controls
- multi-file batch compression
- fully private — files never leave the browser

## tech

next.js · ffmpeg.wasm · typescript · tailwind css v4 · vitest
