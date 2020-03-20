import {Game} from './game';

export interface ApiResponse {
  success: boolean;
  message: string;
  game?: Game;
}
