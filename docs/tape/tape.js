"use strict";
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
class AudioVisualize {
    //
    constructor(params) {
        if (!document || !window) {
            throw Error('document not loaded');
        }
        if (!params.playButton || !params.volControl || !params.panControl || !params.visualCanvas || !params.playList) {
            throw Error('params missing');
        }
        // initial player
        this.playState = false;
        this.playList = params.playList;
        // initial audio element 
        this.audioElement = new Audio();
        this.audioElement.preload = 'none';
        this.audioElement.loop = false;
        this.audioElement.controls = true;
        this.audioElement.crossOrigin = "anonymous";
        // initial audio context 
        this.audioContext = new AudioContext();
        this.track = this.audioContext.createMediaElementSource(this.audioElement);
        // initial dom selector
        this.playButton = document.querySelector(params.playButton);
        this.volControl = document.querySelector(params.volControl);
        this.panControl = document.querySelector(params.panControl);
        this.visualCanvas = document.querySelector(params.visualCanvas);
        if (!this.playButton || !this.volControl || !this.panControl || !this.visualCanvas) {
            throw ReferenceError('selector not valied');
        }
        this.enablePlay();
    }
    // reset play list
    resetPlayList(playList) {
        this.playState = false;
        this.track && this.track.disconnect();
        this.gainNode && this.gainNode.disconnect();
        this.panner && this.panner.disconnect();
        this.analyser && this.analyser.disconnect();
        this.playList = playList;
        this.audioElement.src = "";
    }
    // change current audio
    changeAudio(index) {
        let idx = index || 0;
        if (this.playList.length <= 0 || idx > this.playList.length)
            return false;
        this.playState = false;
        this.track && this.track.disconnect();
        this.gainNode && this.gainNode.disconnect();
        this.panner && this.panner.disconnect();
        this.analyser && this.analyser.disconnect();
        this.audioElement.src = this.playList[idx].src;
        this.audioElement.load();
        this._enableControls();
        return true;
    }
    _enableControls() {
        this.enableVolume();
        this.enablePanner();
        this.enableAnalyse();
    }
    // connect to audio track
    setTrack() {
        this.track.connect(this.gainNode)
            .connect(this.panner)
            .connect(this.analyser)
            .connect(this.audioContext.destination);
    }
    playHandler() {
        if (this.playState === false) {
            this.audioElement.play();
            this.playState = true;
            this.playButton.dataset.playing = 'true';
        }
        else {
            this.audioElement.pause();
            this.playState = false;
            this.playButton.dataset.playing = 'false';
        }
    }
    // control play
    enablePlay() {
        if (!this.audioElement || !this.playButton || !this.audioContext)
            return;
        this.audioContext.resume().then(() => {
            this.playButton.addEventListener('click', this.playHandler.bind(this), false);
            this.audioElement.addEventListener('ended', () => {
                this.playState = false;
                this.playButton.dataset.playing = 'false';
            }, false);
        }).catch(err => { console.log(err); });
    }
    // control volume
    enableVolume() {
        let self = this;
        if (!this.volControl || !this.track || !this.audioContext) {
            return;
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.gainNode = this.audioContext.createGain();
        this.volControl.addEventListener('input', function () {
            self.gainNode.gain.value = Number(this.value);
            self.setTrack();
        }, false);
    }
    // control panner
    enablePanner() {
        let self = this;
        if (!this.volControl || !this.panControl || !this.track || !this.audioContext) {
            return;
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.panner = this.audioContext.createStereoPanner();
        this.panner.pan.value = 0.0;
        this.panControl.addEventListener('input', function () {
            self.panner.pan.value = Number(this.value);
            self.setTrack();
        }, false);
    }
    // drw canvas
    draw(analyser, dataArray, canvasCtx, WIDTH, HEIGHT, count) {
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        analyser.getByteFrequencyData(dataArray);
        let value = 0, step = Math.round(dataArray.length / count), x = 0, y = 0, lineWidth = canvasCtx.lineWidth = WIDTH / count, index = count;
        canvasCtx.strokeStyle = "#999";
        while (index) {
            value = dataArray[index * step + step];
            x = index * lineWidth;
            y = HEIGHT - value * 1.5;
            canvasCtx.beginPath();
            canvasCtx.moveTo(x, HEIGHT);
            canvasCtx.lineTo(x, y);
            canvasCtx.stroke();
			canvasCtx.strokeStyle = "rgb(0 30 0)";
            index -= 2;
        }
        requestAnimationFrame(() => this.draw(analyser, dataArray, canvasCtx, WIDTH, HEIGHT, count));
    }
    ;
    // controls visualize
    enableAnalyse() {
        if (!this.audioContext || !this.visualCanvas)
            return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        if (this.visualCanvas.getContext('2d')) {
            let canvasCtx = this.visualCanvas.getContext('2d'), WIDTH = this.visualCanvas.width, HEIGHT = this.visualCanvas.height;
            this.analyser = this.audioContext.createAnalyser();
            this.setTrack();
            let dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            let count = Math.min(70, dataArray.length);
            // draw an oscilloscope of the current audio source
            this.draw(this.analyser, dataArray, canvasCtx, WIDTH, HEIGHT, count);
        }
    }
}
