import {Card} from '../Class/card';

export interface Game {
  gameId: string;
  password: string;
  players: string[];
  deck: Card[];
  playersDeck: [Card[]];
  gameStarted: boolean;
  tableCard: Card[];
  playerTurn: number;
  userDrawCard: boolean;
  skipTurnCounter: number;
  drawCardsCounter: number;
  lastUserCard: Card;
  reverseDirection: boolean;
  tableColor: number;
}
