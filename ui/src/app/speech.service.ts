import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

interface ResponseEntry {
  timestamp: string;
  text: string;
  keyword: string;
  response: string;
}

@Injectable({ providedIn: 'root' })
export class SpeechService {
  recognition: any;
  lastDetectedKeyword: string = '';
  private responses: ResponseEntry[] = [];
  private synthesis: SpeechSynthesis;

  // Observables to emit recognized text and backend response
  recognizedTexts$ = new BehaviorSubject<string[]>([]);
  backendResponse$ = new BehaviorSubject<ResponseEntry[]>([]);

  constructor(private http: HttpClient) {
    const { webkitSpeechRecognition }: any = window as any;
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;

    // Initialize Text-to-Speech
    this.synthesis = (window as any).speechSynthesis;

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript;
          console.log('Recognized text:', text);

          // Append the recognized text to history
          const currentTexts = this.recognizedTexts$.value;
          this.recognizedTexts$.next([...currentTexts, text]);

          // POST to Spring Boot backend with keyword info
          this.http.post<any>('http://localhost:8080/speech/text', { 
            text: text,
            keyword: this.lastDetectedKeyword
          }).subscribe({
            next: (response) => {
              console.log('Backend response:', response);
              
              // Extract only the text field from JSON response
              const responseText = response.text;
              
            // Speak the response text              
              // Append new response to history
              const entry: ResponseEntry = {
                timestamp: new Date().toLocaleTimeString(),
                text: text,
                keyword: this.lastDetectedKeyword,
                response: responseText
              };
              
              this.responses.push(entry);
              this.backendResponse$.next([...this.responses]);
              console.log('Updated response history:', this.responses);
              this.speakText(responseText);
     
            },
            error: (err) => console.error('Backend error:', err)
          });
        }
      }
    };
  }

  startListening(keyword: string = '') {
    this.lastDetectedKeyword = keyword;
    this.recognition.start();
  }

  stopListening() {
    this.recognition.stop();
  }

  speakText(text: string): void {
    console.log('🎤 Attempting to speak text:', text);
    
    try {
      if (!this.synthesis) {
        console.error('❌ speechSynthesis not available');
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      // Small delay to ensure cancel completes
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Mac/Chrome compatible settings
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        utterance.onstart = () => {
          console.log('✅ Speech started:', text);
        };

        utterance.onend = () => {
          console.log('✅ Speech finished');
        };

        utterance.onerror = (event: any) => {
          console.error('❌ Speech synthesis error:', event.error);
        };

        utterance.onpause = () => {
          console.log('⏸️ Speech paused');
        };

        utterance.onresume = () => {
          console.log('▶️ Speech resumed');
        };

        console.log('📢 Speaking with volume:', utterance.volume);
        this.synthesis.speak(utterance);
      }, 100);
      
    } catch (error) {
      console.error('❌ Failed to speak text:', error);
    }
  }

  // Test method to verify text-to-speech works
  testSpeech(): void {
    console.log('Testing speech synthesis...');
    const testMsg = 'Hello, this is a test. Can you hear me?';
    this.speakText(testMsg);
  }
}