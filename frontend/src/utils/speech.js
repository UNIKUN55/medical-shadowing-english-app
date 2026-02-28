/**
 * TTS（Text-to-Speech）サービス
 */
export class TTSService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isSpeaking = false;
  }

  /**
   * ブラウザ対応確認
   */
  isSupported() {
    return 'speechSynthesis' in window;
  }

  /**
   * 音声再生
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('お使いのブラウザは音声合成に対応していません'));
        return;
      }

      // 既存の再生を停止
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // オプション設定
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        reject(new Error(`音声再生エラー: ${event.error}`));
      };

      this.synth.speak(utterance);
    });
  }

  /**
   * 再生停止
   */
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }
}

/**
 * STT（Speech-to-Text）サービス
 */
export class STTService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('お使いのブラウザは音声認識に対応していません');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.isRecording = false;
    this.silenceTimeout = null;
    this.finalTranscript = '';
    
    // 録音機能の追加
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordedBlob = null;
  }

  /**
   * ブラウザ対応確認
   */
  isSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * マイク権限確認
   */
  async checkMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      throw new Error('マイクへのアクセスが拒否されました。ブラウザの設定でマイクを許可してください。');
    }
  }

  /**
   * 録音開始（音声ファイル保存用）
   */
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.recordedBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
    } catch (err) {
      console.error('録音デバイスアクセスエラー:', err);
    }
  }

  /**
   * 録音開始
   */
  start() {
    return new Promise((resolve, reject) => {
      if (this.isRecording) {
        reject(new Error('既に録音中です'));
        return;
      }

      this.finalTranscript = '';
      this.isRecording = true;
      this.recordedBlob = null;

      // 録音開始（音声ファイル保存用）
      this.startRecording();

      // 結果イベント（改善版：無音検出調整）
      this.recognition.onresult = (event) => {
        // 無音タイムアウトをクリア
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout);
        }

        const transcript = event.results[0][0].transcript;
        this.finalTranscript = transcript;

        // 2秒間の無音許容時間を設定
        this.silenceTimeout = setTimeout(() => {
          if (this.isRecording) {
            this.stop();
          }
        }, 2000); // 2秒に延長（元は即座に停止）
      };

      // エラーイベント（改善版：ユーザーフレンドリーなメッセージ）
      this.recognition.onerror = (event) => {
        this.isRecording = false;
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout);
        }

        // 録音停止
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }

        let errorMessage = '音声認識エラーが発生しました';

        switch (event.error) {
          case 'no-speech':
            errorMessage = '音声が検出されませんでした。もう一度お試しください。';
            break;
          case 'audio-capture':
            errorMessage = 'マイクが見つかりません。マイクが接続されているか確認してください。';
            break;
          case 'not-allowed':
            errorMessage = 'マイクへのアクセスが拒否されました。ブラウザの設定でマイクを許可してください。';
            break;
          case 'network':
            errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
            break;
          case 'aborted':
            errorMessage = '録音が中断されました。';
            break;
          default:
            errorMessage = `音声認識エラー: ${event.error}`;
        }

        reject(new Error(errorMessage));
      };

      // 終了イベント
      this.recognition.onend = () => {
        this.isRecording = false;
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout);
        }

        // 録音停止
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }

        if (this.finalTranscript) {
          resolve(this.finalTranscript);
        } else {
          reject(new Error('音声が認識できませんでした。もう一度お試しください。'));
        }
      };

      // 録音開始
      try {
        this.recognition.start();
      } catch (error) {
        this.isRecording = false;
        reject(new Error('音声認識の開始に失敗しました: ' + error.message));
      }
    });
  }

  /**
   * 録音停止
   */
  stop() {
    if (this.isRecording && this.recognition) {
      this.recognition.stop();
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
      }
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * 録音した音声のURLを取得
   */
  getRecordedAudio() {
    if (this.recordedBlob) {
      return URL.createObjectURL(this.recordedBlob);
    }
    return null;
  }

  /**
   * 録音データをクリア
   */
  clearRecordedAudio() {
    if (this.recordedBlob) {
      const url = this.getRecordedAudio();
      if (url) {
        URL.revokeObjectURL(url);
      }
      this.recordedBlob = null;
      this.audioChunks = [];
    }
  }
}