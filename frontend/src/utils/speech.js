/**
 * Text-to-Speech (TTS) 機能
 */
export class TTSService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
  }

  /**
   * テキストを音声で再生
   * @param {string} text - 再生するテキスト
   * @param {object} options - オプション（lang, rate, pitch, volume）
   * @returns {Promise} 再生完了のPromise
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      // 既存の音声を停止
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // オプション設定
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 1.0;  // 速度（0.1〜10）
      utterance.pitch = options.pitch || 1.0; // 音程（0〜2）
      utterance.volume = options.volume || 1.0; // 音量（0〜1）

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(new Error(`TTS Error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  /**
   * 音声再生を停止
   */
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * 再生中かどうか
   */
  isSpeaking() {
    return this.synth.speaking;
  }

  /**
   * ブラウザがTTSをサポートしているか
   */
  static isSupported() {
    return 'speechSynthesis' in window;
  }
}

/**
 * Speech-to-Text (STT) 機能
 */
export class STTService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this.recognition = null;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
  }

  /**
   * 音声認識を開始
   * @returns {Promise<string>} 認識されたテキスト
   */
  start() {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech Recognition is not supported'));
        return;
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event) => {
        reject(new Error(`STT Error: ${event.error}`));
      };

      this.recognition.onend = () => {
        // 認識終了時の処理（必要に応じて）
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 音声認識を停止
   */
  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * ブラウザがSTTをサポートしているか
   */
  static isSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * マイク権限をチェック
   */
  static async checkMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * ブラウザ対応状況をチェック
 */
export function checkBrowserSupport() {
  return {
    tts: TTSService.isSupported(),
    stt: STTService.isSupported(),
    getUserMedia: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  };
}