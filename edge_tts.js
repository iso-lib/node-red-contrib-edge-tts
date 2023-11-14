const fs = require("fs");
const EdgeTTS = require("./src/EdgeTTS");


module.exports = function (RED) {
	function edgeTTSNode(config) {
        RED.nodes.createNode(this, config);
		var node = this;
		
		node.on('input', function (msg) {
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
			
			var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
			    function adopt(value) { 
			    	return value instanceof P ? value : new P(function (resolve) 
		    		{ resolve(value); 

		    		}); 
		    	}
			    return new (P || (P = Promise))(function (resolve, reject) {
			        function fulfilled(value) { 
				        try { 
					        step(generator.next(value)); 
					    } catch (e) { 
						    reject(e); 
						} 
					}
			        function rejected(value) { 
				        try { 
					        step(generator["throw"](value)); 
					        } catch (e) { 
						        reject(e); 
						    } 
						}
			        function step(result) { 
				        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); 
				    }
			        step((generator = generator.apply(thisArg, _arguments || [])).next());
			    });
			};
			Object.defineProperty(exports, "__esModule", { value: true });

			(() => __awaiter(void 0, void 0, void 0, function* () {
			    const tts = new EdgeTTS.MsEdgeTTS(null, true);
			    yield tts.setMetadata(ttsPer, ttsQuality, ttsPitch, ttsRate, ttsVolume);
			    const filePath = yield tts.toFile(ttsPath, ttsData);
			}))()				   
			 .then(function(filePath) {
					    node.status({ text: `Done! ${ttsPath}` });
					    
						fs.readFile(ttsPath , function(err,body) {
							if (err) throw err;
							var buffer = {data:body};
							//console.log( buffer);
							node.send({platform: 'ms-edge' , data: ttsData , path: ttsPath , result: buffer});
							});
				    })
						.catch(function(error) {
						   node.send("Error:", error);
						 });
		})
	}
	RED.nodes.registerType("edge-tts", edgeTTSNode);
}
