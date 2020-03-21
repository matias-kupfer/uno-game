import { DeckColor, DeckDefinition } from '../interfaces';
import { deckNumbers, deckSpecialCards } from '../constants';


/**
 * @deprecated
 */
export class Deck implements DeckDefinition {

  public red: DeckColor;
  public blue: DeckColor;
  public yellow: DeckColor;
  public green: DeckColor;

  constructor() {
    this.red = {
      numbers: deckNumbers,
      specialCards: deckSpecialCards
    };
    this.blue = {
      numbers: deckNumbers,
      specialCards: deckSpecialCards
    };
    this.yellow = {
      numbers: deckNumbers,
      specialCards: deckSpecialCards
    };
    this.green = {
      numbers: deckNumbers,
      specialCards: deckSpecialCards
    };
  }
}
