import * as Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(gameConfig);
});
