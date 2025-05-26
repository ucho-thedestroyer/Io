StarWars = (function () {
  function StarWars(args) {
    this.el = $(args.el);
    this.audio = this.el.find("audio").get(0);

    // Set playback speed
    this.audio.playbackRate = 0.8;

    // Setup Web Audio API
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const source = context.createMediaElementSource(this.audio);

    // === Broken Radio Effects ===

    // 1. Highpass filter (cut lows)
    const highpass = context.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 1000;

    // 2. Distortion
    const distortion = context.createWaveShaper();
    distortion.curve = makeDistortionCurve(150);
    distortion.oversample = "4x";

    // 3. Detune-like effect using delay (subtle flutter)
    const delay = context.createDelay();
    delay.delayTime.value = 0.01;

    const feedback = context.createGain();
    feedback.gain.value = 0.2;

    delay.connect(feedback);
    feedback.connect(delay);

    // Connect the audio graph
    source.connect(highpass);
    highpass.connect(distortion);
    distortion.connect(delay);
    delay.connect(context.destination);

    // Animation control
    this.start = this.el.find(".start");
    this.animation = this.el.find(".animation");
    this.reset();

    this.start.bind(
      "click",
      $.proxy(function () {
        this.start.hide();
        context.resume(); // Ensure context is started
        this.audio.play();
        this.el.append(this.animation);
      }, this)
    );

    $(this.audio).bind(
      "ended",
      $.proxy(function () {
        this.audio.currentTime = 0;
        this.reset();
      }, this)
    );

    // --- Distortion curve function ---
    function makeDistortionCurve(amount) {
      const k = typeof amount === "number" ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180;
      let i = 0,
        x;
      for (; i < n_samples; ++i) {
        x = (i * 2) / n_samples - 1;
        curve[i] =
          ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      return curve;
    }
  }

  StarWars.prototype.reset = function () {
    this.start.show();
    this.cloned = this.animation.clone(true);
    this.animation.remove();
    this.animation = this.cloned;
  };

  return StarWars;
})();
