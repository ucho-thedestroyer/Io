StarWars = (function() {

  function StarWars(args) {
    this.el = $(args.el);
    this.audio = this.el.find('audio').get(0);

    // Setup Web Audio API
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sourceNode = this.audioContext.createMediaElementSource(this.audio);

    // Create gain nodes for mixing
    this.songGain = this.audioContext.createGain();
    this.noiseGain = this.audioContext.createGain();
    this.noiseGain.gain.value = 0.1; // White noise volume

    // Bandpass filter for broken radio effect
    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = 'bandpass';
    this.filter.frequency.value = 1000;
    this.filter.Q.value = 1;

    // Create white noise source
    this.noiseSource = this.createWhiteNoise();

    // Connect nodes:
    // Song -> filter -> songGain
    this.sourceNode.connect(this.filter);
    this.filter.connect(this.songGain);

    // Noise -> noiseGain
    this.noiseSource.connect(this.noiseGain);

    // Merge song and noise
    this.merger = this.audioContext.createGain();
    this.songGain.connect(this.merger);
    this.noiseGain.connect(this.merger);

    // Connect to output
    this.merger.connect(this.audioContext.destination);

    // Playback speed 80%
    this.audio.playbackRate = 0.8;

    this.started = false;

    this.startBtn = this.el.find('.start');
    this.animation = this.el.find('.animation');

    this.reset();

    this.startBtn.bind('click', $.proxy(function() {
      this.startBtn.hide();

      // Resume AudioContext on user interaction
      this.audioContext.resume().then(() => {
        this.audio.play();
        this.el.append(this.animation);
      });

      this.started = true;
    }, this));

    $(this.audio).bind('ended', $.proxy(function() {
      this.audio.currentTime = 0;
      this.reset();
    }, this));
  }

  StarWars.prototype.createWhiteNoise = function() {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    whiteNoise.start(0);
    return whiteNoise;
  };

  StarWars.prototype.reset = function() {
    this.startBtn.show();
    this.cloned = this.animation.clone(true);
    this.animation.remove();
    this.animation = this.cloned;
  };

  return StarWars;

})();

const intro = new StarWars({
  el : '.starwars'
});
