import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WakewordService } from './wakeword.service';
import { SpeechService } from './speech.service';

interface ResponseEntry {
  timestamp: string;
  text: string;
  keyword: string;
  response: string;
  htmlResponse?: SafeHtml;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto;">
      <h1>Wake-Word Demo</h1>
      <p><strong>Status:</strong> Listening for wake word...</p>
      
      <button (click)="testSpeech()" style="padding: 10px 20px; margin-bottom: 20px; background-color: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
        🔊 Test Speech (Hear Audio)
      </button>
      
      <div style="margin-top: 20px;">
        <h2>API Response Output</h2>
        <div *ngIf="responses.length > 0" style="max-height: 300px; overflow-y: auto;">
          <div *ngFor="let entry of responses" style="margin-bottom: 8px; padding: 10px; background-color: #c8e6c9; border-radius: 3px; border-left: 3px solid #4caf50;">
            <div [innerHTML]="entry.htmlResponse" style="font-size: 15px; color: #1b5e20;"></div>
          </div>
        </div>
        <div *ngIf="responses.length === 0" style="padding: 10px; color: #999;">
          Waiting for API response...
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  recognizedTexts: string[] = [];
  responses: ResponseEntry[] = [];

  constructor(
    private wakewordService: WakewordService,
    private speechService: SpeechService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Subscribe to speech service updates
    this.speechService.recognizedTexts$.subscribe(texts => {
      this.recognizedTexts = texts;
    });

    this.speechService.backendResponse$.subscribe(responses => {
      // Convert text responses for display
      this.responses = responses.map(entry => ({
        ...entry,
        htmlResponse: this.sanitizer.bypassSecurityTrustHtml(
          `<div style='color: #1976d2;'>${entry.response}</div>`
        )
      }));
    });

    // Initialize wake word detection
    this.wakewordService.initWakeWord();
  }

  testSpeech() {
    this.speechService.testSpeech();
  }
}