import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as speechCommands from '@tensorflow-models/speech-commands';
import { SpeechService } from './speech.service';

@Injectable({ providedIn: 'root' })
export class WakewordService {
  recognizer: any;

  constructor(private speechService: SpeechService) {}

  async initWakeWord() {
    try {
      // Initialize TensorFlow.js with CPU backend
      await tf.setBackend('cpu');
      await tf.ready();

      // Load pretrained model
      this.recognizer = speechCommands.create('BROWSER_FFT');
      await this.recognizer.ensureModelLoaded();

      // Get available keywords
      const words = this.recognizer.wordLabels();
      console.log('Available keywords:', words);

      this.recognizer.listen((result: any) => {
        const scores = result.scores;
        const detectedWord = words[scores.indexOf(Math.max(...scores))];
        const confidence = Math.max(...scores);

        console.log(`Detected: "${detectedWord}" (confidence: ${confidence.toFixed(2)})`);

        // Trigger listening if high confidence detected (can be any word)
        if (confidence > 0.75 && detectedWord !== 'unknown' && detectedWord !== '_silence_') {
          console.log('Wake-word detected!');
          this.speechService.startListening(detectedWord);
        }
      }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75
      });

      console.log('Wake-word detection initialized.');
    } catch (error) {
      console.error('Failed to initialize wake-word detection:', error);
    }
  }

  stopWakeWord() {
    if (this.recognizer) this.recognizer.stopListening();
  }
}