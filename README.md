An simple Azure Speech Service module that uses the Microsoft Edge Read Aloud API.



## 节点功能为将输入的文字转为语音,并存储为mp3文件


### 本节点基于微软EDGE浏览器的大声朗读语音合成引擎,无需注册,直接使用,无期限.

#### 可直接在本节点TTS文本框内输入文字,如果留空则会使用上个节点传来的msg.data的内容



![](sample.png)



输入：

msg.data：要转换的文本内容

msg.path：语音文件存放路径，缺省为当前路径tts.mp3

msg.per：声音角色，也可从下拉框选择,缺省为zh-CN-XiaoxiaoNeural

还有几个隐藏属性，供高级玩家设置

msg.quality：合成音频格式及质量，缺省为audio-24khz-48kbitrate-mono-mp3

msg.pitch：音调，缺省是0

msg.rate：语速，缺省是0

msg.volume：音量，缺省是0



Thanks

@Migushthe2nd

[@Migushthe2nd]: https://github.com/iso-lib/MsEdgeTTS




结束

****