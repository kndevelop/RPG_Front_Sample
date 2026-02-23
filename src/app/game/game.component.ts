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

  ngAfterViewInit(): void {

    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x87ceeb
    });

    this.container.nativeElement.appendChild(app.view as any);

    new GameEngine(app);
  }
}