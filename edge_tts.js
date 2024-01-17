const fs = require("fs");
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');


module.exports = function (RED) {
	function edgeTTSNode(config) {
        RED.nodes.createNode(this, config);
		var node = this;
		
		node.on('input', function (msg, send) {
			node.status('');
			var ttsData,ttsPath,ttsPer,ttsQuality,ttsPitch,ttsRate,ttsVolume;
			if  (config.data.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) {
				ttsData = msg.data|| "Warning, the text to speech content is empty, please check the parameters";
			} else {
				ttsData = config.data;
			}
			if  (config.path.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) {
				ttsPath = msg.path||'tts.mp3';
			} else {
				ttsPath = config.path;
			}
			if  (config.per.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) {
				ttsPer = msg.per||"zh-CN-XiaoxiaoNeural";
			} else {
				ttsPer = config.per;
			}
			//if  (config.quality.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) {
			//	ttsQuality = msg.quality||"AUDIO_16KHZ_128KBITRATE_MONO_MP3";
			//} else {
			//	ttsQuality = config.quality;
			//}
			ttsQuality = msg.quality||"audio-24khz-48kbitrate-mono-mp3";
			ttsPitch = msg.pitch||0;
			ttsRate = msg.rate||0;
			ttsVolume = msg.volume||0;




(async () => {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(ttsPer, ttsQuality);
    const filePath = await tts.toFile(ttsPath, ttsData);  
})()
    .then(function(filePath) {
					    node.status({ text: `Done! ${ttsPath}` });
					    
						fs.readFile(ttsPath , function(err,body) {
							if (err) throw err;
							msg.result = {data:body};
							msg.platform="ms-edge";
							msg.data=ttsData;
							msg.path=ttsPath;

							//node.send({platform: 'ms-edge' , data: ttsData , path: ttsPath , result: buffer});
							send(msg);
							});
				    })
						.catch(function(error) {
						   node.send("Error:", error);
						 });
		})
	}
	RED.nodes.registerType("edge-tts", edgeTTSNode);
}
