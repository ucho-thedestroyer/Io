StarWars = (function () {
  function StarWars(args) {
    this.el = $(args.el);
    this.audio = this.el.find('audio').get(0);

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sourceNode = this.audioContext.createMediaElementSource(this.audio);

    this.songGain = this.audioContext.createGain();
    this.noiseGain = this.audioContext.createGain();
    this.noiseGain.gain.value = 0.05; // Adjust for radio effect

    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = 'bandpass';
    this.filter.frequency.value = 1000;
    this.filter.Q.value = 0.7;

    // Create white noise buffer
    this.noiseBuffer = this.audioContext.createBuffer(1, 2 * this.audioContext.sampleRate, this.audioContext.sampleRate);
    let data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    this.noiseSource = null;
    this.playNoise = () => {
      this.noiseSource = this.audioContext.createBufferSource();
      this.noiseSource.buffer = this.noiseBuffer;
      this.noiseSource.loop = true;
      this.noiseSource.connect(this.noiseGain);
      this.noiseSource.start(0);
    };

    // Connect everything
    this.sourceNode.connect(this.filter);
    this.filter.connect(this.songGain);

    this.songGain.connect(this.audioContext.destination);
    this.noiseGain.connect(this.audioContext.destination);

    this.audio.playbackRate = 0.8;

    this.startBtn = this.el.find('.start');
    this.animation = this.el.find('.animation');

    this.reset();

    this.startBtn.on('click touchstart', (e) => {
      e.preventDefault();
      this.startBtn.hide();

      this.audioContext.resume().then(() => {
        this.playNoise();
        this.audio.play();
        this.el.append(this.animation);
      });
    });

    $(this.audio).on('ended', () => {
      this.audio.currentTime = 0;
      if (this.noiseSource) this.noiseSource.stop();
      this.reset();
    });
  }

  StarWars.prototype.reset = function () {
    this.startBtn.show();
    this.cloned = this.animation.clone(true);
    this.animation.remove();
    this.animation = this.cloned;
  };

  return StarWars;
})();

$(document).ready(function () {
  new StarWars({ el: '.starwars' });
});
