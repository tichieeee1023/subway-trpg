const ENDING_DIALOGUES = {
  BAD_1: {
  ENGINEER: '“아니야… 내가 뭔가 하나를 놓친 거야. 분명히…”',
  GYM: '“아오 씨… 조금만 더 세게 밀었으면 열렸는데…”',
  RUNNER: '“아… 그냥 처음부터 튈걸.”',
  NEGOTIATOR: '“말도 안 돼… 내가 이 정도 상황도 수습 못 한다고?”',
  GAMBLER: '“아… 진짜? 여기서 터진다고?”'
},

BAD_2: {
  ENGINEER: '“잠깐… 이건 역이 아니었어. 왜 이제야…”',
  GYM: '“뭐야… 이런 건 때려 부수면 되는 거 아니었어…?”',
  RUNNER: '“젠장… 오늘 그냥 버스탈걸….”',
  NEGOTIATOR: '“내가 잘못 판단했다고…? 내가?”',
  GAMBLER: '“와… 출구인 줄 알고 올인했는데.”'
},

BAD_3: {
  ENGINEER: '“아니… 여기까지 계산했는데, 마지막에 이게…”',
  GYM: '“놔…! 여기까지 왔는데 이걸 못 뿌리친다고…?”',
  RUNNER: '“아니, 잠깐… 나 거의 다 튀었는데…!”',
  NEGOTIATOR: '“말도 안 돼… 내가 여기서 끝난다고?”',
  GAMBLER: '“와… 진짜 막판에 뒤집히네….”'
},

NORMAL: {
  ENGINEER: '“나오긴 했는데… 아직도 환청이 들리는 것 같아….”',
  GYM: '“살았는데… 왜 몸이 계속 떨리지.”',
  RUNNER: '“밖인데… 왜 아직도 도망쳐야 할 것 같지.”',
  NEGOTIATOR: '“끝난 거 맞아. 맞는데… 왜 하나도 안 끝난 것 같지.”',
  GAMBLER: '“살아는 나왔는데… 이건 이긴 판 같지가 않네.”'
},

  GOOD: {
    ENGINEER: '“기억나는 건 전부 정리해 둬야 해.”',
    GYM: '“끝까지 버텼으면 된 거지.”',
    RUNNER: '“이번엔 제대로 빠져나왔어… 그냥 막 도망친 게 아니라.”',
    NEGOTIATOR: '“이제는 천천히 설명할 수 있을 것 같아.”',
    GAMBLER: '“운도 좀 따랐고… 내가 잘한 것도 있고.”'
  },

  TRUE: {
    ENGINEER: '“증거도 있어. 이제 이건 설명할 수 있어.”',
    GYM: '“됐다! 살아 나왔으면 내가 이긴 거지!”',
    RUNNER: '“이젠 다신 내가 지하철 출퇴근 하나봐라.”',
    NEGOTIATOR: '“결국 내 판단이 맞았잖아. 처음부터 끝까지.”',
    GAMBLER: '“이걸 뒤집네… 오늘 진짜 역대급 대박이었다.”'
  }
};

const ENDING_DESCRIPTIONS = {
  BAD_1: '붉은 비상등만 깜빡이는 객차 안에서, 마지막 인기척마저 조용히 사라졌다.',

  BAD_2: '출구라고 믿었던 통로가 닫힌 뒤, 익숙했던 역은 더 이상 역의 모습을 하고 있지 않았다.',

  BAD_3: '지상은 가까이 있었지만, 끝내 마지막 몇 걸음을 허락하지 않았다.',

  NORMAL: '지상에 올라선 뒤에도 한동안 숨을 고르지 못했다. 그래도 발밑은 분명한 아스팔트였다.',

  GOOD: '새벽 공기와 함께 구조대의 불빛이 가까워졌다. 손에 남은 흔적만이 그 밤이 실제였음을 말해 주고 있었다.',

  TRUE: '증거와 기록은 살아남았다. 그날 밤의 지하는 더 이상 아무 일도 없었던 장소로 돌아갈 수 없었다.'
};

export function getEndingJobEpilogue(profileId, endingId) {
  const dialogue = ENDING_DIALOGUES[endingId]?.[profileId];
  const description = ENDING_DESCRIPTIONS[endingId];
  return dialogue && description ? { dialogue, description } : null;
}
