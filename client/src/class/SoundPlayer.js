// Require Node.js Dependencies
const { readFile } = require("fs").promises;
const { join } = require("path");

// CONSTANTS
const SOUNDS_ASSETS_PATH = join(__dirname, "..", "..", "assets", "sounds");

class SoundPlayer {

  /**
   * @function loadSoundAsset
   * @param {*} audio
   * @param {!string} assetNameOrPath
   * @param {object} [options]
   * @param {number} [options.volume=1]
   * @param {boolean} [options.loop=false]
   * @returns {SoundPlayer}
   */
  static async loadSoundAsset(audio, assetNameOrPath, options = {}) {
    const { volume = 1, loop = false, pan = 0, pitch = 0 } = options;

    const ctx = audio.getContext();
    const fileBuffer = await readFile(join(SOUNDS_ASSETS_PATH, assetNameOrPath));
    const buffer = await ctx.decodeAudioData(fileBuffer.buffer);
    const sound = new SoundPlayer(ctx, audio.masterGain, buffer);

    sound.setVolume(volume);
    sound.setLoop(loop);
    sound.setPan(pan);
    sound.setPitch(pitch);

    return sound;
  }

  constructor(audioCtx, audioMasterGain, buffer) {
    this.offset = 0;
    this.isLooping = false;
    this.volume = 1;
    this.pitch = 0;
    this.pan = 0;
    this.audioCtx = audioCtx;
    this.audioMasterGain = audioMasterGain;
    this.buffer = buffer;
    this.source = null;
  }

  destroy() {
    this.stop();
    this.audioCtx = null;
    this.audioMasterGain = null;
    this.source = null;
  }

  play() {
    if (this.audioCtx === null || this.buffer === null) {
      return;
    }
    if (this.state === SoundPlayer.State.Playing) {
      return;
    }
    if (this.source !== null) {
      this.stop();
    }

    // if this.buffer instanceof HTMLAudioElement
    if (typeof this.buffer === "string") {
      const audio = new Audio();
      audio.src = this.buffer;
      this.source = this.audioCtx.createMediaElementSource(audio);

      // FIXME: Very new so not included in d.ts file just yet
      if (this.source.mediaElement === null) {
        this.source = null;
        return;
      }
      this.source.mediaElement.loop = this.isLooping;
    }
    else {
      // Assuming AudioBuffer
      this.source = this.audioCtx.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.loop = this.isLooping;

      // NOTE: As of November 2015, playbackRate is not supported on MediaElementSources
      // so let's only apply it for buffer sources
      this.source.playbackRate.value = Math.pow(2, this.pitch);
    }

    this.pannerNode = this.audioCtx.createStereoPanner();
    this.pannerNode.pan.value = this.pan;
    this.pannerNode.connect(this.audioMasterGain);

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = this.volume;
    this.gainNode.connect(this.pannerNode);

    this.source.connect(this.gainNode);

    this.state = SoundPlayer.State.Playing;
    // NOTE: As of Chrome 46, addEventListener("ended") doesn't work!
    this.source.onended = () => { this.state = SoundPlayer.State.Stopped; };

    this.startTime = this.audioCtx.currentTime - this.offset;

    if (this.source.mediaElement != null) {
      this.source.mediaElement.currentTime = this.offset;
      this.source.mediaElement.play();
    }
    else {
      this.source.start(0, this.offset);
    }
  }

  stop() {
    if (this.audioCtx === null) {
      return;
    }

    if (this.source !== null) {
      if (this.source.mediaElement !== null) {
        this.source.mediaElement.pause();
        this.source.mediaElement.currentTime = 0;
      }
      else {
        this.source.stop(0);
      }

      this.source.disconnect();
      delete this.source;

      this.gainNode.disconnect();
      delete this.gainNode;

      this.pannerNode.disconnect();
      delete this.pannerNode;
    }

    this.offset = 0;
    this.state = SoundPlayer.State.Stopped;
  }

  pause() {
    if (this.audioCtx === null || this.source === null) {
      return;
    }

    this.offset = this.audioCtx.currentTime - this.startTime;
    if (this.source.mediaElement != null) {
      this.source.mediaElement.pause();
    }
    else {
      this.source.stop(0);
    }

    this.source.disconnect();
    delete this.source;

    this.gainNode.disconnect();
    delete this.gainNode;

    this.pannerNode.disconnect();
    delete this.pannerNode;

    this.state = SoundPlayer.State.Paused;
  }

  getState() {
    // Workaround Webkit audio's lack of support for the onended callback
    if (this.state === SoundPlayer.State.Playing) {
      if (this.source.playbackState !== null && this.source.playbackState === this.source.FINISHED_STATE) {
        this.state = SoundPlayer.State.Stopped;
      }
      else if (this.source.mediaElement !== null && this.source.mediaElement.paused) {
        this.state = SoundPlayer.State.Stopped;
      }
    }

    return this.state;
  }

  setLoop(isLooping) {
    this.isLooping = isLooping;
    if (this.source === null) {
      return;
    }

    if (this.source.mediaElement !== null) {
      this.source.mediaElement.loop = this.isLooping;
    }
    else {
      this.source.loop = this.isLooping;
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.source !== null) {
      this.gainNode.gain.value = this.volume;
    }
  }

  setPan(pan) {
    this.pan = Math.max(-1, Math.min(1, pan));

    if (this.source !== null) {
      this.pannerNode.pan.value = this.pan;
    }
  }

  setPitch(pitch) {
    this.pitch = Math.max(-1, Math.min(1, pitch));

    // NOTE: playbackRate is not supported on MediaElementSources
    if (this.source !== null && this.source.playbackRate !== null) {
      this.source.playbackRate.value = Math.pow(2, this.pitch);
    }
  }
}

SoundPlayer.State = Object.freeze({
  Playing: 1,
  Paused: 2,
  Stopped: 3
});

module.exports = SoundPlayer;
