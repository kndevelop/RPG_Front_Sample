import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as PIXI from 'pixi.js';
import { GameEngine } from './engine/game-engine';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements AfterViewInit {

  @ViewChild('container', { static: true })
  container!: ElementRef<HTMLDivElement>;

  @ViewChild('bgmAudio')
  bgmAudio!: ElementRef<HTMLAudioElement>;

  ngAfterViewInit(): void {

    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x87ceeb
    });

    this.container.nativeElement.appendChild(app.view as any);

    new GameEngine(app);

    // ブラウザの自動再生制限を回避するため、最初のクリックでBGMを再生
    const playBgm = () => {
      this.bgmAudio.nativeElement.play()
        .then(() => {
          console.log('BGM playback started');
          window.removeEventListener('pointerdown', playBgm);
        })
        .catch(err => {
          console.error('BGM playback failed:', err);
        });
    };

    window.addEventListener('pointerdown', playBgm);
  }
}