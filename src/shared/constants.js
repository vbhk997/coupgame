export const ROLES = {
  DUKE: 'Duke',
  ASSASSIN: 'Assassin',
  CAPTAIN: 'Captain',
  AMBASSADOR: 'Ambassador',
  CONTESSA: 'Contessa',
};

export const ACTIONS = {
  INCOME: 'Income',
  FOREIGN_AID: 'Foreign Aid',
  COUP: 'Coup',
  TAX: 'Tax',
  ASSASSINATE: 'Assassinate',
  EXCHANGE: 'Exchange',
  STEAL: 'Steal',
};

export const COUNTER_ACTIONS = {
  BLOCK_FOREIGN_AID: 'Block Foreign Aid',
  BLOCK_ASSASSINATION: 'Block Assassination',
  BLOCK_STEAL: 'Block Steal',
};

export const GAME_STATES = {
  LOBBY: 'Lobby',
  PLAYING: 'Playing',
  GAME_OVER: 'Game Over',
};

export const TURN_STATES = {
  WAITING_FOR_ACTION: 'Waiting for Action',
  WAITING_FOR_CHALLENGE_OR_BLOCK: 'Waiting for Challenge or Block',
  WAITING_FOR_REVEAL: 'Waiting for Reveal',
  WAITING_FOR_EXCHANGE: 'Waiting for Exchange',
  WAITING_FOR_BLOCK_RESPONSE: 'Waiting for Block Response', // Challenge to a block
};
