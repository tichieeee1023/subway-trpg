import { ITEM_DB } from './itemDB.js';
import { CHARACTER_PORTRAITS } from './assetDB.js';

export const ARCHETYPES = [
  {
    id: 'ENGINEER',
    portraits: CHARACTER_PORTRAITS.ENGINEER,
    title: '분석형 엔지니어',
    quote: '"문제가 생겼다면 원인이 있다. 구조부터 하나씩 확인하면 돼."',
    stats: { STR: 9, DEX: 11, INT: 14, WILL: 10, LUK: 10 },
    items: [
      { ...ITEM_DB.laptop_bag },
      { ...ITEM_DB.glasses }
    ]
  },

  {
    id: 'GYM',
    portraits: CHARACTER_PORTRAITS.GYM,
    title: '생존형 헬스인',
    quote: '"버티는 건 자신 있다. 길이 막혔으면 힘으로라도 뚫어야지."',
    stats: { STR: 14, DEX: 11, INT: 9, WILL: 10, LUK: 10 },
    items: [
      { ...ITEM_DB.tumbler },
      { ...ITEM_DB.protein_bar }
    ]
  },

  {
    id: 'RUNNER',
    portraits: CHARACTER_PORTRAITS.RUNNER,
    title: '칼퇴 지향 회피러',
    quote: '"위험한 곳에 오래 있을 이유는 없어. 살 길부터 찾는다."',
    stats: { STR: 9, DEX: 14, INT: 11, WILL: 10, LUK: 10 },
    items: [
      { ...ITEM_DB.id_wire },
      { ...ITEM_DB.running_shoes }
    ]
  },

  {
    id: 'NEGOTIATOR',
    portraits: CHARACTER_PORTRAITS.NEGOTIATOR,
    title: '강철 멘탈 협상가',
    quote: '"겁먹으면 판단부터 흐려진다. 일단 상황을 정리하고 움직이자."',
    stats: { STR: 10, DEX: 10, INT: 11, WILL: 14, LUK: 9 },
    items: [
      { ...ITEM_DB.candy },
      { ...ITEM_DB.metal_pen }
    ]
  },

  {
    id: 'GAMBLER',
    portraits: CHARACTER_PORTRAITS.GAMBLER,
    title: '한탕주의 승부사',
    quote: '"될 놈은 된다. 여기까지 왔으면 한 번쯤은 운도 따라주겠지."',
    stats: { STR: 10, DEX: 10, INT: 10, WILL: 9, LUK: 15 },
    items: [
      { ...ITEM_DB.lottery },
      { ...ITEM_DB.lucky_coin }
    ]
  }
];