
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsEdgeTTS = void 0;
const axios_1 = require("axios");
const stream = require("stream");
const ws_1 = require("ws");
const crypto_1 = require("crypto");
const OUTPUT_FORMAT_1 = require("./OUTPUT_FORMAT");
const fs = require("fs");
class MsEdgeTTS {
    /**
     * Create a new `MsEdgeTTS` instance.
     *
     * @param enableLogger=false whether to enable the built-in logger. This logs connections inits, disconnects, and incoming data to the console
     * @param agent (optional) Use a custom http.Agent implementation like [https-proxy-agent](https://github.com/TooTallNate/proxy-agents) or [socks-proxy-agent](https://github.com/TooTallNate/proxy-agents/tree/main/packages/socks-proxy-agent).
     */
    constructor(agent, enableLogger = false) {
        this._queue = {};
        this._startTime = 0;
        this._pitch = 0;
        this._rate = 0;
        this._volume = 0;
        this._enableLogger = false;
        this._agent = agent;
    }
    _log(...o) {
        if (this._enableLogger) {
            console.log(...o);
        }
    }
    _send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 1; i <= 3 && this._ws.readyState !== this._ws.OPEN; i++) {
                if (i == 1) {
                    this._startTime = Date.now();
                }
                this._log("connecting: ", i);
                yield this._initClient();
            }
            this._ws.send(message, () => {
                this._log("<- sent message: ", message);
            });
        });
    }
    _initClient() {
        this._ws = new ws_1.WebSocket(MsEdgeTTS.SYNTH_URL, { agent: this._agent });
        return new Promise((resolve, reject) => {
            this._ws.on("open", () => {
                this._log("Connected in", (Date.now() - this._startTime) / 1000, "seconds");
                this._send(`Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n
                    {
                        "context": {
                            "synthesis": {
                                "audio": {
                                    "metadataoptions": {
                                        "sentenceBoundaryEnabled": "false",
                                        "wordBoundaryEnabled": "false"
                                    },
                                    "outputFormat": "${this._outputFormat}" 
                                }
                            }
                        }
                    }
                `).then(resolve);
            });
            this._ws.on("message", (m) => {
                const message = m.toString();
                const requestId = /X-RequestId:(.*?)\r\n/gm.exec(message)[1];
                if (message.includes("Path:turn.start")) {
                    // start of turn, ignore
                }
                else if (message.includes("Path:turn.end")) {
                    // end of turn, close stream
                    this._queue[requestId].push(null);
                }
                else if (message.includes("Path:response")) {
                    // context response, ignore
                }
                else if (message.includes("Path:audio")) {
                    if (m instanceof Buffer) {
                        this.cacheAudioData(m, requestId);
                    }
                    else {
                        console.log("UNKNOWN MESSAGE", message);
                    }
                }
                else {
                    console.log("UNKNOWN MESSAGE", message);
                }
            });
            this._ws.on("upgrade", (m) => {
                this._log("upgrade", m);
            });
            this._ws.on("close", () => {
                this._log("disconnected after:", (Date.now() - this._startTime) / 1000, "seconds");
            });
            this._ws.on("error", function (error) {
                reject("Connect Error: " + error);
            });
        });
    }
    cacheAudioData(m, requestId) {
        const index = m.indexOf(MsEdgeTTS.BINARY_DELIM) + MsEdgeTTS.BINARY_DELIM.length;
        const audioData = m.slice(index, m.length);
        this._queue[requestId].push(audioData);
        // this._log("receive audio chunk size: ", audioData?.length)
    }
    _SSMLTemplate(input) {
        return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${this._voiceLocale}">
                <voice name="${this._voice}">
                    <prosody pitch='+${this._pitch}Hz' rate ='+${this._rate}%' volume='+${this._volume}%'>
                        ${input}
                    </prosody>
                </voice>
            </speak>`;
    }
    /**
     * Fetch the list of voices available in Microsoft Edge.
     * These, however, are not all. The complete list of voices supported by this module [can be found here](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support) (neural, standard, and preview).
     */
    getVoices() {
        return new Promise((resolve, reject) => {
            axios_1.default.get(MsEdgeTTS.VOICES_URL)
                .then((res) => resolve(res.data))
                .catch(reject);
        });
    }
    /**
     * Sets the required information for the speech to be synthesised and inits a new WebSocket connection.
     * Must be called at least once before text can be synthesised.
     * Saved in this instance. Can be called at any time times to update the metadata.
     *
     * @param voiceName a string with any `ShortName`. A list of all available neural voices can be found [here](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#neural-voices). However, it is not limited to neural voices: standard voices can also be used. A list of standard voices can be found [here](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#standard-voices)
     * @param outputFormat any {@link OUTPUT_FORMAT}
     * @param pitch (default 0)
     * @param volume (default 0)
     * @param rate (default 0)
     * @param voiceLocale (optional) any voice locale that is supported by the voice. See the list of all voices for compatibility. If not provided, the locale will be inferred from the `voiceName`
     */
    setMetadata(voiceName, outputFormat, pitch = 0, rate = 0, volume = 0, voiceLocale) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldVoice = this._voice;
            const oldVoiceLocale = this._voiceLocale;
            const oldOutputFormat = this._outputFormat;
            const oldPitch = this._pitch;
            const oldRate = this._rate;
            const oldVolume = this._volume;
            this._voice = voiceName;
            this._voiceLocale = voiceLocale;
            this._pitch = pitch;
            this._rate = rate;
            this._volume = volume;
            if (!this._voiceLocale) {
                const voiceLangMatch = MsEdgeTTS.VOICE_LANG_REGEX.exec(this._voice);
                if (!voiceLangMatch)
                    throw new Error("Could not infer voiceLocale from voiceName!");
                this._voiceLocale = voiceLangMatch[0];
            }
            this._outputFormat = outputFormat;
            const changed = oldVoice !== this._voice
                || oldVoiceLocale !== this._voiceLocale
                || oldOutputFormat !== this._outputFormat
                || oldPitch != pitch
                || oldRate != rate
                || oldVolume != volume;
            // create new client
            if (changed || this._ws.readyState !== this._ws.OPEN) {
                this._startTime = Date.now();
                yield this._initClient();
            }
        });
    }
    _metadataCheck() {
        if (!this._ws)
            throw new Error("Speech synthesis not configured yet. Run setMetadata before calling toStream or toFile.");
    }
    /**
     * Writes raw audio synthesised from text to a file. Uses a basic {@link _SSMLTemplate SML template}.
     *
     * @param path a valid output path, including a filename and file extension.
     * @param input the input to synthesise
     * @returns {Promise<string>} - a `Promise` with the full filepath
     */
    toFile(path, input) {
        return this._rawSSMLRequestToFile(path, this._SSMLTemplate(input));
    }
    /**
     * Writes raw audio synthesised from text in real-time to a {@link stream.Readable}. Uses a basic {@link _SSMLTemplate SML template}.
     *
     * @param input the text to synthesise. Can include SSML elements.
     */
    toStream(input) {
        return this._rawSSMLRequest(this._SSMLTemplate(input));
    }
    /**
     * Writes raw audio synthesised from text to a file. Has no SSML template. Basic SSML should be provided in the request.
     *
     * @param path a valid output path, including a filename and file extension.
     * @param requestSSML the SSML to send. SSML elements required in order to work.
     * @returns {Promise<string>} - a `Promise` with the full filepath
     */
    rawToFile(path, requestSSML) {
        return this._rawSSMLRequestToFile(path, requestSSML);
    }
    /**
     * Writes raw audio synthesised from a request in real-time to a {@link stream.Readable}. Has no SSML template. Basic SSML should be provided in the request.
     *
     * @param requestSSML the SSML to send. SSML elements required in order to work.
     */
    rawToStream(requestSSML) {
        return this._rawSSMLRequest(requestSSML);
    }
    _rawSSMLRequestToFile(path, requestSSML) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const stream = this._rawSSMLRequest(requestSSML);
            const chunks = [];
            stream.on("data", (data) => chunks.push(data));
            stream.once("close", () => __awaiter(this, void 0, void 0, function* () {
                const output = fs.createWriteStream(path);
                while (chunks.length > 0) {
                    yield new Promise((resolve) => output.write(chunks.shift(), resolve));
                }
                resolve(path);
            }));
        }));
    }
    _rawSSMLRequest(requestSSML) {
        this._metadataCheck();
        const requestId = crypto_1.randomBytes(16).toString("hex");
        const request = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n
                ` + requestSSML.trim();
        // https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup
        const readable = new stream.Readable({
            read() {
            },
        });
        this._queue[requestId] = readable;
        this._send(request).then();
        return readable;
    }
}
exports.MsEdgeTTS = MsEdgeTTS;
MsEdgeTTS.OUTPUT_FORMAT = OUTPUT_FORMAT_1.OUTPUT_FORMAT;
MsEdgeTTS.TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
MsEdgeTTS.VOICES_URL = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=${MsEdgeTTS.TRUSTED_CLIENT_TOKEN}`;
MsEdgeTTS.SYNTH_URL = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${MsEdgeTTS.TRUSTED_CLIENT_TOKEN}`;
MsEdgeTTS.BINARY_DELIM = "Path:audio\r\n";
MsEdgeTTS.VOICE_LANG_REGEX = /\w{2}-\w{2}/;
