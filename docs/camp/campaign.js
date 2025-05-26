StarWars = (function() {
  
  function StarWars(args) {
    this.el = $(args.el);
    this.audio = this.el.find('audio').get(0);
    this.start = this.el.find('.start');
    this.animation = this.el.find('.animation');
    this.reset();

    // Setup Web Audio API and effects
    this.setupAudioEffects();

    this.start.bind('click', $.proxy(function() {
      this.start.hide();

      // Resume audio context (required by browsers)
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Play the audio
      this.audio.play();

      // Show animation
      this.el.append(this.animation);
    }, this));

    $(this.audio).bind('ended', $.proxy(function() {
      this.audio.currentTime = 0;
      this.reset();
    }, this));
  }
  
  StarWars.prototype.reset = function() {
    this.start.show();
    this.cloned = this.animation.clone(true);
    this.animation.remove();
    this.animation = this.cloned;
  };

  StarWars.prototype.setupAudioEffects = function() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    // Wrap <audio> element in MediaElementSourceNode
    this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);

    // Create delay node for warble effect
    this.delayNode = this.audioCtx.createDelay();
    this.delayNode.delayTime.value = 0.005; // base delay 5ms

    // Create LFO oscillator to modulate delay time
    this.lfo = this.audioCtx.createOscillator();
    this.lfo.frequency.value = 5; // 5Hz warble frequency

    this.lfoGain = this.audioCtx.createGain();
    this.lfoGain.gain.value = 0.003; // modulation depth ~3ms

    // Connect LFO to delay time parameter
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.delayNode.delayTime);
    this.lfo.start();

    // Bandpass filter for radio-like frequency shaping
    this.bandpass = this.audioCtx.createBiquadFilter();
    this.bandpass.type = 'bandpass';
    this.bandpass.frequency.value = 1000; // center freq 1kHz
    this.bandpass.Q.value = 1.5;

    // Distortion for rough texture
    this.distortion = this.audioCtx.createWaveShaper();
    this.distortion.curve = this.makeDistortionCurve(400);
    this.distortion.oversample = '4x';

    // Create white noise buffer source
    this.whiteNoise = this.createWhiteNoiseNode();

    // Gain node to control white noise volume
    this.whiteNoiseGain = this.audioCtx.createGain();
    this.whiteNoiseGain.gain.value = 0.02; // adjust noise level here

    // Connect white noise source -> gain -> destination
    this.whiteNoise.connect(this.whiteNoiseGain);
    this.whiteNoiseGain.connect(this.audioCtx.destination);
    this.whiteNoise.start();

    // Connect audio source chain: source -> delay -> bandpass -> distortion -> destination
    this.sourceNode.connect(this.delayNode);
    this.delayNode.connect(this.bandpass);
    this.bandpass.connect(this.distortion);
    this.distortion.connect(this.audioCtx.destination);
  };

  StarWars.prototype.makeDistortionCurve = function(amount) {
    const k = typeof amount === 'number' ? amount : 50,
          n_samples = 44100,
          curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * Math.PI / 180) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  };

  StarWars.prototype.createWhiteNoiseNode = function() {
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoiseSource = this.audioCtx.createBufferSource();
    whiteNoiseSource.buffer = noiseBuffer;
    whiteNoiseSource.loop = true;
    return whiteNoiseSource;
  };

  return StarWars;
})();
  
const intro = new StarWars({
  el : '.starwars'
});
