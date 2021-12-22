import {MsEdgeTTS} from "msedge-tts";
import fs from "fs";
const tts = new MsEdgeTTS();


module.exports = function (RED) {
	function edgeTTSNode(config) {
        RED.nodes.createNode(this, config);
		var node = this;
		node.on('input', function (msg) {
			var ttsData,ttsPath,ttsPer,ttsQuality;
			if (config.data != '' && config.data != null ) {
				ttsData = config.data;
			} else {
				ttsData = msg.data;
			}
			if (config.path != '' && config.path != null ) {
				ttsPath = config.path;
			} else {
				ttsPath = 'tts.mp3'
			}
			if (config.per != '' && config.per != null ) {
				ttsPer = config.per;
			} else {
				ttsPer = "zh-CN-XiaoxiaoNeural"
			}
			if (config.quality != '' && config.quality != null ) {
				ttsQuality = config.quality;
			} else {
				ttsQuality = "AUDIO_16KHZ_128KBITRATE_MONO_MP3"
			}
			(function () {
				return new Promise(async (resolve, reject) => {
					try {
						await tts.setMetadata(ttsPer, MsEdgeTTS.OUTPUT_FORMATS[ttsQuality]);
						const filePath = await tts.toFile(ttsPath, ttsData); 
						node.status({ text: `EDGE语音，保存为 ${ttsPath}` });
						fs.readFile(ttsPath , function(err,body) {
							if (err) throw err;
							var buffer = {data:body};
							console.log( buffer);
							node.send({platform: 'ms-edge' , result: buffer});
						});
					} catch (err) { reject(err) }
				});
			}) ();
			// gettts();


		})
	}
	RED.nodes.registerType("edge-tts", edgeTTSNode);
}
