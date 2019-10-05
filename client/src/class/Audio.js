class Audio {
  constructor() {
    this.ctx = null;
  }

  getContext() {
    if (this.ctx !== null) {
      return this.ctx;
    }
    if (window.AudioContext === null) {
      return null;
    }

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1;
    this.masterGain.connect(this.ctx.destination);

    return this.ctx;
  }

  get masterVolume() {
    if (this.getContext() === null) {
      return 0;
    }

    return this.masterGain.gain.value;
  }

  set masterVolume(volume) {
    if (typeof volume !== "number") {
      throw new TypeError("volume must be a number");
    }

    if (this.getContext() !== null) {
      this.masterGain.gain.value = volume;
    }
  }
}

module.exports = Audio;
