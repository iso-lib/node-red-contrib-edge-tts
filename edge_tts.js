const { MsEdgeTTS } = require('msedge-tts');
const fs = require('fs');
const { SocksProxyAgent } = require('socks-proxy-agent') ;

module.exports = function(RED) {
    function MsEdgeTTSNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.on('input', async function(msg,send,done) {
            if (msg.agent || config.agent) {
                const agent = new SocksProxyAgent(msg.agent || config.agent);
                tts = new MsEdgeTTS(agent);
                // node.send({agent: agent,tts: tts});
            } else {
                tts = new MsEdgeTTS();
            };
            const metaOptions = {
                voiceLocale: msg.voiceLocale || config.voiceLocale || 'en-US',
                sentenceBoundaryEnabled: msg.sentenceBoundary || config.sentenceBoundary || false,
                wordBoundaryEnabled: msg.wordBoundary || config.wordBoundary || false
            };
            const voiceOptions = {
                rate: (msg.rate || config.rate || 0) + '%',
                pitch: (msg.pitch || config.pitch || 0) + 'Hz',
                volume: msg.volume || config.volume || 100
            };
            try {

                await tts.setMetadata(msg.voice || config.voice , msg.format || config.format ,metaOptions);
                const { audioStream } = await tts.toStream(msg.text || config.text , voiceOptions );
                let chunks = [];
                audioStream.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                audioStream.on('end', () => {
                    msg.result = Buffer.concat(chunks);
                    const filename = msg.filename || config.filename || `tts_${Date.now()}.mp3`;
                    fs.writeFile(filename, msg.result, (err) => {
                        if (err) {
                            node.error(`Failed to save file: ${err.message}`, msg);
                            node.status({ fill: "red", shape: "ring", text: "Saving failed" });
                            return done(err);
                        }
                        node.status({ fill: "green", shape: "dot", text: "Save successful" });
                        msg.filename = filename;
                        send(msg);
                        if (done) { done(); }
                    });
                });
                audioStream.on("close", () => {
                });
                audioStream.on('error', (err) => {
                    node.error(`TTS stream error: ${err.message}`, msg);
                    node.status({ fill: "red", shape: "ring", text: "error" });
                    if (done) { done(err); }
                });
            } catch (err) {
                node.error('Speech synthesis failed: ' + err.message, msg);
            }
        });
    }
    
    RED.nodes.registerType('edge-tts', MsEdgeTTSNode);
};