# node-red-contrib-edge-tts

A Node-RED node that converts text to speech using Microsoft Edge's Text-to-Speech service. This node provides a simple way to integrate Azure Speech Service capabilities into your Node-RED flows without requiring an Azure account or API key.

## Overview

This node uses the Microsoft Edge Read Aloud API to generate high-quality speech from text. It supports a wide range of voices across multiple languages and dialects, with customizable speech parameters such as rate, pitch, and volume.



## Changlog

### 2025-04-25 ：

- Update version 3. x
- Not compatible with version 2. x
- Add voice character
- Add new agent
- Other modifications



## Features

- No Azure account or API key required
- 100+ neural voices across multiple languages
- Adjustable speech parameters (rate, pitch, volume)
- Multiple output formats
- Support for SOCKS proxy
- Word and sentence boundary markers (optional)

## Installation

Install via Node-RED's Manage Palette:

```
node-red-contrib-edge-tts
```

Or install via npm:

```bash
npm install node-red-contrib-edge-tts
```

## Requirements

- Node.js >= 16.0.0
- Node-RED >= 3.0.0

## Usage

1. Drag the "MS Edge TTS" node from the TTS category in the palette to your flow
2. Configure the node with your desired voice and other parameters
3. Send a message with text to convert to speech
3. ![](src/sample1.png)
3. ![](src/sample2.png)

### Input

The node accepts the following input properties:

- `msg.payload` (string): Text to convert to speech (if `msg.text` is not provided)
- `msg.text` (string): Text to convert to speech (takes precedence over payload)
- `msg.filename` (string): Path to save the audio file (default: `tts_[timestamp].mp3`)
- `msg.voice` (string): Voice to use for speech synthesis
- `msg.rate` (number): Speech rate adjustment (-100 to 100)
- `msg.pitch` (number): Speech pitch adjustment in Hz
- `msg.volume` (number): Speech volume (0-100)
- `msg.format` (string): Audio output format
- `msg.agent` (string): SOCKS proxy URL (if needed)
- `msg.voiceLocale` (string): Voice locale
- `msg.sentenceBoundary` (boolean): Enable sentence boundary markers
- `msg.wordBoundary` (boolean): Enable word boundary markers

### Output

The node outputs a message with the following properties:

- `msg.result`: Buffer containing the audio data
- `msg.filename`: Path to the saved audio file

## Configuration

### Basic Settings

- **Name**: Custom name for the node (optional)
- **Voice**: Select from 100+ available neural voices
- **Text**: Default text to convert (can be overridden by input message)
- **Filename**: Default path to save the audio file

### Advanced Settings

- **Rate**: Speech rate adjustment (-100 to 100)
- **Pitch**: Speech pitch adjustment in Hz
- **Volume**: Speech volume (0-100)
- **Format**: Audio output format (default: audio-24khz-48kbitrate-mono-mp3)
- **Voice Locale**: Voice locale setting
- **Sentence Boundary**: Enable sentence boundary markers
- **Word Boundary**: Enable word boundary markers
- **Proxy Agent**: SOCKS proxy URL (if needed)

## Example Flow

A simple example flow is included in the examples directory.

## Supported Voices

The node supports a wide range of voices across multiple languages and dialects, including:

- English (US, UK, Australia, etc.)
- Chinese (Mandarin, Cantonese, etc.)
- And many more

## License

Refer to the LICENSE file in the repository.

## Credits

This node is based on the [msedge-tts](https://github.com/microsoft/msedge-tts) package.

## Issues and Contributions

Please report any issues or feature requests on the [GitHub repository](https://github.com/iso-lib/node-red-contrib-edge-tts/issues).