// sometimes typescript fails to process these two modules, but they work fine in javascript
import { allwords } from './allwords';
import { answers } from './answers';
import React, { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
//import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Button,
  Share,
} from 'react-native';
import Constants from 'expo-constants';
import { Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Wordle Starter code
// Feel free to reuse code from the Wordle Solution on Replit
// https://replit.com/@RomainRobbes/WordleSolution#index.ts

// one change is that we do not use files for reading the words anymore, for simplicity
// the resources are defined in TypeScript modules

// the files that we read, and we put words to uppercase
//const answers:string[] = readFileSync('answers.txt', 'utf-8').split("\n").map(s => s.toUpperCase())
//const allwords: string[] = readFileSync('allwords.txt', 'utf-8').split("\n").map(s => s.toUpperCase())
type StrCallback = (arg: String) => void;
type Callback0 = () => void;
type ArrCallback = (arg: number[]) => void;
const apiKey: String = 'vd3oxbrmc77bp4gwdu7ru3503qx1rdl67207cu3sqzyniun0i';

interface DordleInterface {
  attempts: number[];
  lost: number;
}

interface WordleInterface {
  attempts: number[];
  lost: number;
}

interface StatisticsInterface {
  dordle: DordleInterface;
  wordle: WordleInterface;
  wordleHard: WordleInterface;
}

const randomWord = (answers: string[]): string => {
  const rand = Math.floor(Math.random() * answers.length);
  return answers[rand];
};

const Letter = ({
  letter,
  backgroundColor,
}: {
  letter: String;
  backgroundColor: number;
}) => {
  return (
    <View
      style={[
        styles.myletter,
        backgroundColor === 1
          ? styles.yellow
          : backgroundColor === 2
          ? styles.green
          : backgroundColor === 3
          ? styles.grey
          : backgroundColor === 4
          ? styles.red
          : styles.white,
      ]}>
      <Text style={styles.letter}>{letter}</Text>
    </View>
  );
};

const Row = ({ word }: { word: (number | String)[][] }) => {
  return (
    <View style={styles.row}>
      {word.map((pair, color) => (
        <Letter letter={pair[0].toString()} backgroundColor={Number(pair[1])} />
      ))}
    </View>
  );
};

const replaceAt = (
  original: String,
  index: number,
  replacement: String
): String => {
  return (
    original.substring(0, index) +
    replacement +
    original.substring(index + replacement.length)
  );
};

const Wordle = ({
  word,
  row,
  guesses,
}: {
  word: String;
  row: number;
  guesses: (String | number)[][][];
}) => {
  let guess: String = '     ';
  for (let i = 0; i < word.length; i++) {
    guess = replaceAt(guess, i, word.charAt(i));
  }
  let guessmap: (String | number)[][] = [];
  for (let i = 0; i < guess.length; i++) {
    guessmap.push([word.charAt(i), 0]);
  }
  return (
    <View>
      {guesses.map((_, i) =>
        i !== row ? <Row word={guesses[i]} /> : <Row word={guessmap} />
      )}
    </View>
  );
};

const Dordle = ({
  word,
  row,
  guesses1,
  guesses2,
  foundsolution1,
  foundsolution2,
}: {
  word: String;
  row: number;
  guesses1: (String | number)[][][];
  guesses2: (String | number)[][][];
  foundsolution1: boolean;
  foundsolution2: boolean;
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.dordle}>
        <Wordle
          word={!foundsolution1 ? word : ''}
          row={row}
          guesses={guesses1}
        />
      </View>
      <View style={styles.dordle}>
        <Wordle
          word={!foundsolution2 ? word : ''}
          row={row}
          guesses={guesses2}
        />
      </View>
    </View>
  );
};

const KeyboardButton = ({
  letter,
  color1,
  color2,
  onPressing,
}: {
  letter: String;
  color1: number;
  color2: number;
  onPressing: StrCallback;
}) => {
  return (
    <View style={styles.keyboardButton}>
      <View
        style={[
          color1 === 1
            ? styles.yellowButton
            : color1 === 2
            ? styles.greenButton
            : color1 === 3
            ? styles.greyButton
            : null,
        ]}
      />
      <View
        style={[
          color2 === 1
            ? styles.yellowButton
            : color2 === 2
            ? styles.greenButton
            : color2 === 3
            ? styles.greyButton
            : null,
        ]}
      />
      <Pressable style={styles.myPressable} onPress={() => onPressing(letter)}>
        <Text style={styles.myPressable}>{letter}</Text>
      </Pressable>
    </View>
  );
};

const letterPositionInArray = (
  array: (String | number)[][],
  letter: String
): number => {
  let position = -1;
  for (let i = 0; i < array.length; i++) {
    if (array[i][0] === letter) {
      position = i;
      break;
    }
  }
  return position;
};

const updatekeyboard1 = (
  mykeyboard: (String | number)[][],
  guess: string,
  solution1: string,
  solution2: string
): (String | number)[][] => {
  let updatedmap: (String | number)[][] = [...mykeyboard];
  for (let i = 0; i < 5; i++) {
    if (guess.charAt(i) === solution1.charAt(i)) {
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][1] = 2;
    } else if (
      solution1.includes(guess.charAt(i)) &&
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][1] != 2
    ) {
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][1] = 1;
    } else if (
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][1] === 0
    ) {
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][1] = 3;
    }
    if (guess.charAt(i) === solution2.charAt(i)) {
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][2] = 2;
    } else if (
      solution2.includes(guess.charAt(i)) &&
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][2] != 2
    ) {
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][2] = 1;
    } else if (
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][2] === 0
    ) {
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][2] = 3;
    }
  }
  return updatedmap;
};

const updatekeyboard2 = (
  mykeyboard: (String | number)[][],
  guess: string,
  solution1: string
): (String | number)[][] => {
  let updatedmap: (String | number)[][] = [...mykeyboard];
  for (let i = 0; i < 5; i++) {
    if (guess.charAt(i) === solution1.charAt(i)) {
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][1] = 2;
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][2] = 2;
    } else if (
      solution1.includes(guess.charAt(i)) &&
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][1] != 2
    ) {
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][1] = 1;
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][2] = 1;
    } else if (
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][1] === 0
    ) {
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][1] = 3;
      updatedmap[letterPositionInArray(updatedmap, guess.charAt(i))][2] = 3;
    }
  }
  return updatedmap;
};

const Keyboard = ({
  setChangeLetter,
  keyboard,
}: {
  setChangeLetter: StrCallback;
  keyboard: (String | number)[][];
}) => {
  const keyboardarray = Array.from(keyboard, ([key, value]) => ({
    key,
    value,
  }));
  let keyboard1 = [];
  let keyboard2 = [];
  let keyboard3 = [];
  for (let i = 0; i < 26; i++) {
    if (i < 10) {
      keyboard1.push(keyboard[i]);
    } else if (i < 19) {
      keyboard2.push(keyboard[i]);
    } else {
      keyboard3.push(keyboard[i]);
    }
  }

  return (
    <View style={styles.keyboard}>
      <View style={styles.row}>
        {keyboard1.map((value) => (
          <KeyboardButton
            letter={value[0].toString().toUpperCase()}
            color1={Number(value[1])}
            color2={Number(value[2])}
            onPressing={setChangeLetter}
          />
        ))}
      </View>
      <View style={styles.row}>
        {keyboard2.map((value) => (
          <KeyboardButton
            letter={value[0].toString().toUpperCase()}
            color1={Number(value[1])}
            color2={Number(value[2])}
            onPressing={setChangeLetter}
          />
        ))}
        <KeyboardButton
          letter={'←'}
          color1={0}
          color2={0}
          onPressing={setChangeLetter}
        />
      </View>
      <View style={styles.row}>
        {keyboard3.map((value) => (
          <KeyboardButton
            letter={value[0].toString().toUpperCase()}
            color1={Number(value[1])}
            color2={Number(value[2])}
            onPressing={setChangeLetter}
          />
        ))}
        <KeyboardButton
          letter="↵"
          color1={0}
          color2={0}
          onPressing={setChangeLetter}
        />
      </View>
    </View>
  );
};
//<KeyboardButton letter={"M"} onPressing={setChangeLetter}/>
const evaluateletters = (
  guessmap: (String | number)[][],
  solution: String | String[],
  position: number
): (String | number)[][] => {
  const [solution1, ...solution2] = solution;
  let newmap = [...guessmap];
  if (position === 5) {
    for (let i = 0; i < newmap.length; i++) {
      if (newmap[i][1] === 0) {
        newmap[i][1] = 3;
      }
    }
    return newmap;
  }
  if (guessmap[position][0] === solution1) {
    newmap[position][1] = 2;
    return evaluateletters(newmap, solution2, position + 1);
  }
  for (let i = 0; i < newmap.length; i++) {
    if (newmap[i][0] === solution1 && newmap[i][1] === 0) {
      newmap[i][1] = 1;
      return evaluateletters(newmap, solution2, position + 1);
    }
  }
  return evaluateletters(newmap, solution2, position + 1);
};

const ReloadButton = ({
  solution,
  result,
  onRealoading,
  changeShowDefinition,
  sharableResult,
}: {
  solution: String;
  result: boolean;
  onRealoading: Callback0;
  changeShowDefinition: Callback0;
  sharableResult: string;
}) => {
  return (
    <View>
      <View style={styles.paragraph}>
        <Text style={styles.result}>You {result ? 'won' : 'lost'}</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.statsButton}>
          <Button onPress={onRealoading} title={'Reload game'} />
        </View>
        <View style={styles.statsButton}>
          <Button onPress={changeShowDefinition} title={'Show definition'} />
        </View>
        <View style={styles.statsButton}>
          <ShareExample text={sharableResult} />
        </View>
      </View>
    </View>
  );
};

const DordleButton = ({
  onGameMode1,
  onGameMode2,
  solution1,
  solution2,
}: {
  onGameMode1: StrCallback;
  onGameMode2: StrCallback;
  solution1: String;
  solution2: String;
}) => {
  return (
    <View style={styles.gameTypeButton}>
      <Button
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onGameMode1(solution1);
          onGameMode2(solution2);
        }}
        title={'Dordle'}
      />
    </View>
  );
};

const WordleButton = ({
  onGameMode,
  solution,
}: {
  onGameMode: StrCallback;
  solution: String;
}) => {
  return (
    <View style={styles.gameTypeButton}>
      <Button
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onGameMode(solution);
        }}
        title={'Wordle'}
      />
    </View>
  );
};

const WordleHardButton = ({
  onGameMode,
  solution,
}: {
  onGameMode: StrCallback;
  solution: String;
}) => {
  return (
    <View style={styles.gameTypeButton}>
      <Button
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onGameMode(solution);
        }}
        title={'Wordle Hard'}
      />
    </View>
  );
};

const storeData = async (value: StatisticsInterface) => {
  try {
    const jsonValue: string = JSON.stringify(value);
    await AsyncStorage.setItem('@storage_Key', jsonValue);
  } catch (e) {
    // saving error
  }
};

const resetStats = (): StatisticsInterface => {
  const games: StatisticsInterface = {
    dordle: { attempts: [0, 0, 0, 0, 0, 0], lost: 0 },
    wordle: { attempts: [0, 0, 0, 0, 0, 0], lost: 0 },
    wordleHard: { attempts: [0, 0, 0, 0, 0, 0], lost: 0 },
  };
  storeData(games);
  return games;
};

const checkhardmode = (
  guess: String,
  lastguess: String,
  solution: String
): boolean => {
  let guessmap = [];
  let lastguessmap = [];
  for (let i = 0; i < guess.length; i++) {
    guessmap.push([guess.charAt(i), 0]);
    lastguessmap.push([lastguess.charAt(i), 0]);
  }
  const valutedlettersguess: (String | number)[][] = evaluateletters(
    guessmap,
    solution,
    0
  );
  const valutedletterslastguess: (String | number)[][] = evaluateletters(
    lastguessmap,
    solution,
    0
  );
  if (!checksimilarity(valutedlettersguess, valutedletterslastguess)) {
    return false;
  }
  return true;
};

const checksimilarity = (
  valutedlettersguess: (String | number)[][],
  valutedletterslastguess: (String | number)[][]
): boolean => {
  let modifyguess: (String | number)[][] = [...valutedlettersguess];
  let iteration: number = valutedlettersguess.length - 1;
  while (iteration >= 0) {
    if (valutedletterslastguess[iteration][1] === 2) {
      if (modifyguess[iteration][1] === 2) {
        modifyguess.splice(iteration, 1);
      } else {
        return false;
      }
    }
    iteration--;
  }
  for (let i = 0; i < valutedletterslastguess.length; i++) {
    if (valutedletterslastguess[i][1] === 1) {
      const guesslength = modifyguess.length;
      for (let k = 0; k < modifyguess.length; k++) {
        if (
          modifyguess[k][0] === valutedletterslastguess[i][0] &&
          modifyguess[k][1] !== 0
        ) {
          modifyguess.splice(k, 1);
          break;
        }
      }
      if (guesslength - 1 !== modifyguess.length) {
        return false;
      }
    }
  }
  return true;
};

const Settings = ({
  onGameMode01,
  onGameMode02,
  onGameMode1,
  onGameMode2,
  onShowSettings,
}: {
  onGameMode01: StrCallback;
  onGameMode02: StrCallback;
  onGameMode1: StrCallback;
  onGameMode2: StrCallback;
  onShowSettings: Callback0;
}) => {
  const [text1, setText1] = React.useState('');
  const [text2, setText2] = React.useState('');
  return (
    <View>
      <DordleButton
        onGameMode1={onGameMode01}
        onGameMode2={onGameMode02}
        solution1={text1}
        solution2={text2}
      />
      <WordleButton onGameMode={onGameMode1} solution={text1} />
      <WordleHardButton onGameMode={onGameMode2} solution={text1} />
      <View style={styles.paragraph}>
        <TextInput
          style={styles.inputText}
          onChangeText={setText1}
          value={text1}
          placeholder={'Place 1st solution'}
        />
        <TextInput
          style={styles.inputText}
          onChangeText={setText2}
          value={text2}
          placeholder={'Place 2nd solution (only for dordle)'}
        />
      </View>
      <View style={styles.gameTypeButton}>
        <Button onPress={onShowSettings} title="statistics" />
      </View>
      <View style={styles.gameTypeButton}>
        <Button onPress={resetStats} title="reset stats" />
      </View>
    </View>
  );
};

const InvalidInput = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  return (
    <View>
      <Text style={styles.invalidInput}>invalid input</Text>
    </View>
  );
};

const Statistics = ({
  changeShowStats,
  statisctics,
}: {
  changeShowStats: Callback0;
  statisctics: string;
}) => {
  const jsonObj: StatisticsInterface = JSON.parse(statisctics);
  const attemptsString: string[] = [
    'one: ',
    'two: ',
    'three: ',
    'four: ',
    'five: ',
    'six: ',
    'seven: ',
  ];
  const dordleResult: string = jsonObj.dordle.attempts
    .map((value, index) => attemptsString[index + 1] + value)
    .join()
    .concat('\nlost: ' + jsonObj.dordle.lost)
    .replace(/,/g, '\n');
  const wordleResult: string = jsonObj.wordle.attempts
    .map((value, index) => attemptsString[index] + value)
    .join()
    .concat('\nlost: ' + jsonObj.wordle.lost)
    .replace(/,/g, '\n');
  const wordleHardResult: string = jsonObj.wordleHard.attempts
    .map((value, index) => attemptsString[index] + value)
    .join()
    .concat('\nlost: ' + jsonObj.wordleHard.lost)
    .replace(/,/g, '\n');
  const formattedOutput: String =
    'Attempts/Losses' +
    '\n\nDordle:\n' +
    dordleResult +
    '\n\nWordle:\n' +
    wordleResult +
    '\n\nWordle Hard:\n' +
    wordleHardResult;

  return (
    <View style={styles.container}>
      <Text style={styles.statistics}>{formattedOutput}</Text>
      <View style={styles.returnButton}>
        <Button onPress={changeShowStats} title="←" />
      </View>
    </View>
  );
};

const Clue = ({
  solution,
  returnToGame,
}: {
  solution: String;
  returnToGame: Callback0;
}) => {
  const [clue, setClue] = React.useState('');
  const url: string = `https://api.wordnik.com/v4/word.json/${solution.toLowerCase()}/definitions?limit=1&includeRelated=false&useCanonical=false&includeTags=false&api_key=${apiKey}`;

  const fetchData = async () => {
    const response = await fetch(url);
    const data = await response.json();
    setClue(data[0].partOfSpeech);
  };

  useEffect(() => {
    fetchData();
  });

  return (
    <View>
      <Text style={styles.paragraph}>{clue}</Text>
      <View style={styles.returnButton}>
        <Button onPress={returnToGame} title="←" />
      </View>
    </View>
  );
};

function replaceAll(str: string, find: string, replace: string) {
  var escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  return str.replace(new RegExp(escapedFind, 'g'), replace);
}

const CriticalClue = ({
  solution,
  returnToGame,
}: {
  solution: string;
  returnToGame: Callback0;
}) => {
  const [clue, setClue] = React.useState('');
  const url: string = `https://api.wordnik.com/v4/word.json/${solution}/topExample?useCanonical=false&api_key=${apiKey}`;
  const fetchData = async () => {
    const response = await fetch(url);
    const data = await response.json();
    setClue(replaceAll(data.text, solution, '[SOLUTION]'));
  };

  useEffect(() => {
    fetchData();
  });

  return (
    <View>
      <Text style={styles.paragraph}>{clue}</Text>
      <View style={styles.returnButton}>
        <Button onPress={returnToGame} title="←" />
      </View>
    </View>
  );
};

const Definition = ({
  solution,
  returnToGame,
}: {
  solution: String;
  returnToGame: Callback0;
}) => {
  const [definition, setDefinition] = React.useState('');
  const url: string = `https://api.wordnik.com/v4/word.json/${solution.toLocaleLowerCase()}/definitions?limit=1&includeRelated=false&useCanonical=false&includeTags=false&api_key=${apiKey}`;
  const fetchData = async () => {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    setDefinition(data[0].text);
  };

  useEffect(() => {
    fetchData();
  });

  return (
    <View>
      <Text style={styles.paragraph}>
        {solution}: {definition}
      </Text>
      <View style={styles.returnButton}>
        <Button onPress={returnToGame} title="←" />
      </View>
    </View>
  );
};

const wordleWin = (gameMode: number, row: number, statistics: string) => {
  const jsonObj: StatisticsInterface = JSON.parse(statistics);
  if (gameMode === 1) {
    jsonObj.wordle.attempts[row] = jsonObj.wordle.attempts[row] + 1;
  } else {
    jsonObj.wordleHard.attempts[row] = jsonObj.wordleHard.attempts[row] + 1;
  }
  storeData(jsonObj);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

const wordleLost = (gameMode: number, statistics: string) => {
  const jsonObj: StatisticsInterface = JSON.parse(statistics);
  if (gameMode === 1) {
    jsonObj.wordle.lost = jsonObj.wordle.lost + 1;
  } else {
    jsonObj.wordleHard.lost = jsonObj.wordleHard.lost + 1;
  }
  storeData(jsonObj);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

const dordleWin = (row: number, statistics: string) => {
  const jsonObj: StatisticsInterface = JSON.parse(statistics);
  jsonObj.dordle.attempts[row - 1] = jsonObj.dordle.attempts[row - 1] + 1;
  storeData(jsonObj);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

const dordleLost = (statistics: string) => {
  const jsonObj: StatisticsInterface = JSON.parse(statistics);
  jsonObj.dordle.lost = jsonObj.dordle.lost + 1;
  storeData(jsonObj);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

const createSharableResult = (
  gameMode: number,
  guesses1: (String | number)[][][],
  guesses2: (String | number)[][][],
  row: number
): string => {
  let sharableResult: string =
    gameMode === 0
      ? 'Dordle' + ' ' + (row + 1) + '/7\n\n'
      : gameMode === 1
      ? 'Wordle' + ' ' + (row + 1) + '/6\n\n'
      : 'Wordle Hard' + ' ' + (row + 1) + '/8\n';
  if (gameMode === 0) {
    for (let i = 0; i < 7; i++) {
      for (let k = 0; k < 5; k++) {
        if (guesses1[i][k][1] === 1) {
          sharableResult = sharableResult.concat('🟨');
        } else if (guesses1[i][k][1] === 2) {
          sharableResult = sharableResult.concat('🟩');
        } else if (guesses1[i][k][1] === 3) {
          sharableResult = sharableResult.concat('🟥');
        } else {
          sharableResult = sharableResult.concat('⬜');
        }
      }
      sharableResult = sharableResult.concat('\t');
      for (let k = 0; k < 5; k++) {
        if (guesses2[i][k][1] === 1) {
          sharableResult = sharableResult.concat('🟨');
        } else if (guesses2[i][k][1] === 2) {
          sharableResult = sharableResult.concat('🟩');
        } else if (guesses2[i][k][1] === 3) {
          sharableResult = sharableResult.concat('🟥');
        } else {
          sharableResult = sharableResult.concat('⬜');
        }
      }
      sharableResult = sharableResult.concat('\n');
    }
  } else {
    for (let i = 0; i < 6; i++) {
      for (let k = 0; k < 5; k++) {
        if (guesses1[i][k][1] === 1) {
          sharableResult = sharableResult.concat('🟨');
        } else if (guesses1[i][k][1] === 2) {
          sharableResult = sharableResult.concat('🟩');
        } else if (guesses1[i][k][1] === 3) {
          sharableResult = sharableResult.concat('🟥');
        } else {
          sharableResult = sharableResult.concat('⬜');
        }
      }
      sharableResult = sharableResult.concat('\n');
    }
  }
  return sharableResult;
};

const ShareExample = ({ text }: { text: string }) => {
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: text,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <View>
      <Button onPress={onShare} title="Share" />
    </View>
  );
};

const GameScreen = ({
  myGameMode,
  onReturnButton,
  mysolution1,
  mysolution2,
  statistics,
}: {
  myGameMode: number;
  onReturnButton: Callback0;
  mysolution1: String;
  mysolution2: String;
  statistics: string;
}) => {
  const [gameMode, setGameMode] = React.useState(myGameMode);
  const [word, setWord] = React.useState('');
  const myguesses1: (String | number)[][][] =
    gameMode === 0
      ? Array(7).fill([
          ['', 0],
          ['', 0],
          ['', 0],
          ['', 0],
          ['', 0],
        ])
      : Array(6).fill([
          ['', 0],
          ['', 0],
          ['', 0],
          ['', 0],
          ['', 0],
        ]);
  const myguesses2: (String | number)[][][] = Array(7).fill([
    ['', 0],
    ['', 0],
    ['', 0],
    ['', 0],
    ['', 0],
  ]);
  const [guesses1, setGuesses1] = React.useState(myguesses1);
  const [guesses2, setGuesses2] = React.useState(myguesses2);
  const [foundsolution1, setFoundsolution1] = React.useState(false);
  const [foundsolution2, setFoundsolution2] = React.useState(false);
  const [row, setRow] = React.useState(0);
  const [solution1, setSolution1] = React.useState(
    allwords.indexOf(mysolution1.toUpperCase()) === -1
      ? randomWord(answers)
      : mysolution1.toUpperCase()
  );
  const [solution2, setSolution2] = React.useState(
    allwords.indexOf(mysolution2.toUpperCase()) === -1
      ? randomWord(answers)
      : mysolution2.toUpperCase()
  );
  const mykeyboard: (String | number)[][] = [
    ['q', 0, 0],
    ['w', 0, 0],
    ['e', 0, 0],
    ['r', 0, 0],
    ['t', 0, 0],
    ['y', 0, 0],
    ['u', 0, 0],
    ['i', 0, 0],
    ['o', 0, 0],
    ['p', 0, 0],
    ['a', 0, 0],
    ['s', 0, 0],
    ['d', 0, 0],
    ['f', 0, 0],
    ['g', 0, 0],
    ['h', 0, 0],
    ['j', 0, 0],
    ['k', 0, 0],
    ['l', 0, 0],
    ['z', 0, 0],
    ['x', 0, 0],
    ['c', 0, 0],
    ['v', 0, 0],
    ['b', 0, 0],
    ['n', 0, 0],
    ['m', 0, 0],
  ];
  const [keyboard, setKeyboard] = React.useState(mykeyboard);
  const [showStats, setShowStats] = React.useState(false);
  const [invalidInput, setInvaludInput] = React.useState(false);
  const [showClue, setShowClue] = React.useState(false);
  const [showCriticalClue, setShowCriticalClue] = React.useState(false);
  const [showDefinition, setShowDefinition] = React.useState(false);
  const [myStatistics, setMyStatistics] = React.useState(statistics);
  const [sharableResult, setSharableResult] = React.useState('');

  useEffect(() => {
    getData();
  }, []);

  const letterCallBack: StrCallback = (letter: String) => {
    if (letter === '↵' && word.length === 5 && allwords.indexOf(word) !== -1) {
      if (
        gameMode === 2 &&
        row !== 0 &&
        !checkhardmode(
          word,
          guesses1[row - 1].map((value, _) => value[0]).join(''),
          solution1
        )
      ) {
        setInvaludInput(true);
        return;
      }
      setKeyboard(
        gameMode === 0
          ? updatekeyboard1(
              keyboard,
              word.toLowerCase(),
              solution1.toLowerCase(),
              solution2.toLowerCase()
            )
          : updatekeyboard2(
              keyboard,
              word.toLowerCase(),
              solution1.toLowerCase()
            )
      );
      if (!foundsolution1) {
        let guessmap1: (String | number)[][] = [];
        for (let i = 0; i < word.length; i++) {
          guessmap1.push([word.charAt(i), 0]);
        }
        const evaluetedletters1: (String | number)[][] = evaluateletters(
          guessmap1,
          solution1.toUpperCase(),
          0
        );
        let temp1 = guesses1;
        temp1[row] = [...evaluetedletters1];
        setGuesses1(temp1);
        if (word === solution1) {
          setFoundsolution1(true);
        }
      }
      if (!foundsolution2) {
        let guessmap2: (String | number)[][] = [];
        for (let i = 0; i < word.length; i++) {
          guessmap2.push([word.charAt(i), 0]);
        }
        const evaluetedletters2: (String | number)[][] = evaluateletters(
          guessmap2,
          solution2.toUpperCase(),
          0
        );
        let temp2 = guesses2;
        temp2[row] = [...evaluetedletters2];
        setGuesses2(temp2);
        if (word === solution2) {
          setFoundsolution2(true);
        }
      }
      setWord('');
      setRow(row + 1);
      if (gameMode !== 0 && word === solution1) {
        wordleWin(gameMode, row, myStatistics);
        setSharableResult(
          createSharableResult(gameMode, guesses1, guesses2, row)
        );
      } else if (gameMode !== 0 && row === 5) {
        wordleLost(gameMode, myStatistics);
        setSharableResult(
          createSharableResult(gameMode, guesses1, guesses2, row)
        );
      } else if (
        gameMode === 0 &&
        ((foundsolution1 && word === solution2) ||
          (word === solution1 && foundsolution2))
      ) {
        dordleWin(row, myStatistics);
        setSharableResult(
          createSharableResult(gameMode, guesses1, guesses2, row)
        );
      } else if (row === 6) {
        dordleLost(myStatistics);
        setSharableResult(
          createSharableResult(gameMode, guesses1, guesses2, row)
        );
      }
    } else if (letter === '↵') {
      setInvaludInput(true);
    }
    if (letter === '←') {
      setWord(word.substring(0, word.length - 1));
      invalidInput ? setInvaludInput(false) : null;
    }
    if (word.length < 5 && letter !== '↵' && letter !== '←') {
      setWord(word + letter);
      invalidInput ? setInvaludInput(false) : null;
    }
  };

  const reset = () => {
    setFoundsolution1(false);
    setFoundsolution2(false);
    setRow(0);
    setSolution1(randomWord(answers));
    setSolution2(randomWord(answers));
    setKeyboard(mykeyboard);
  };

  const onReloadingDordle: Callback0 = () => {
    gameMode === 0
      ? onGameModeDordle()
      : gameMode === 1
      ? onGameModeWordle()
      : onGameModeWordleHard();
  };

  const onGameModeDordle = () => {
    setGameMode(0);
    setGuesses1(
      Array(7).fill([
        ['', 0],
        ['', 0],
        ['', 0],
        ['', 0],
        ['', 0],
      ])
    );
    setGuesses2(
      Array(7).fill([
        ['', 0],
        ['', 0],
        ['', 0],
        ['', 0],
        ['', 0],
      ])
    );
    reset();
  };

  const onGameModeWordle = () => {
    setGameMode(1);
    setGuesses1(
      Array(6).fill([
        ['', 0],
        ['', 0],
        ['', 0],
        ['', 0],
        ['', 0],
      ])
    );
    reset();
  };

  const onGameModeWordleHard = () => {
    setGameMode(2);
    setGuesses1(
      Array(6).fill([
        ['', 0],
        ['', 0],
        ['', 0],
        ['', 0],
        ['', 0],
      ])
    );
    reset();
  };

  const changeShowStats: Callback0 = () => {
    getData();
    showStats === false ? setShowStats(true) : setShowStats(false);
  };

  const changeShowClue: Callback0 = () => {
    showClue ? setShowClue(false) : setShowClue(true);
  };

  const changeShowCriticalClue: Callback0 = () => {
    showCriticalClue ? setShowCriticalClue(false) : setShowCriticalClue(true);
  };

  const changeShowDefinition: Callback0 = () => {
    showDefinition ? setShowDefinition(false) : setShowDefinition(true);
  };

  const getData = async () => {
    try {
      const jsonValue: string | null = await AsyncStorage.getItem(
        '@storage_Key'
      );
      if (jsonValue === null) {
        setMyStatistics(JSON.stringify(resetStats()));
      } else {
        setMyStatistics(jsonValue);
      }
    } catch (e) {
      // error reading value
    }
  };

  return showStats ? (
    <Statistics changeShowStats={changeShowStats} statisctics={myStatistics} />
  ) : showClue ? (
    <Clue
      solution={!foundsolution1 ? solution1 : solution2}
      returnToGame={changeShowClue}
    />
  ) : showCriticalClue ? (
    <CriticalClue
      solution={!foundsolution1 ? solution1 : solution2}
      returnToGame={changeShowCriticalClue}
    />
  ) : showDefinition ? (
    <Definition solution={solution1} returnToGame={changeShowDefinition} />
  ) : (
    <View style={styles.container}>
      <View style={styles.row}>
        <DordleButton
          onGameMode1={onGameModeDordle}
          onGameMode2={onGameModeDordle}
          solution1={''}
          solution2={''}
        />
        <WordleButton onGameMode={onGameModeWordle} solution={''} />
        <WordleHardButton onGameMode={onGameModeWordleHard} solution={''} />
        {invalidInput ? <InvalidInput /> : null}
      </View>
      {gameMode === 0 ? (
        row === guesses1.length ? (
          !(foundsolution1 && foundsolution2) ? (
            <ReloadButton
              solution={solution1}
              result={false}
              onRealoading={onReloadingDordle}
              changeShowDefinition={changeShowDefinition}
              sharableResult={sharableResult}
            />
          ) : (
            <ReloadButton
              solution={solution1}
              result={true}
              onRealoading={onReloadingDordle}
              changeShowDefinition={changeShowDefinition}
              sharableResult={sharableResult}
            />
          )
        ) : foundsolution1 && foundsolution2 ? (
          <ReloadButton
            solution={solution1}
            result={true}
            onRealoading={onReloadingDordle}
            changeShowDefinition={changeShowDefinition}
            sharableResult={sharableResult}
          />
        ) : null
      ) : row === guesses1.length ? (
        !foundsolution1 ? (
          <ReloadButton
            solution={solution1}
            result={false}
            onRealoading={onReloadingDordle}
            changeShowDefinition={changeShowDefinition}
            sharableResult={sharableResult}
          />
        ) : (
          <ReloadButton
            solution={solution1}
            result={true}
            onRealoading={onReloadingDordle}
            changeShowDefinition={changeShowDefinition}
            sharableResult={sharableResult}
          />
        )
      ) : foundsolution1 ? (
        <ReloadButton
          solution={solution1}
          result={true}
          onRealoading={onReloadingDordle}
          changeShowDefinition={changeShowDefinition}
          sharableResult={sharableResult}
        />
      ) : null}
      {gameMode === 0 ? (
        <Dordle
          word={word}
          row={row}
          guesses1={guesses1}
          guesses2={guesses2}
          foundsolution1={foundsolution1}
          foundsolution2={foundsolution2}
        />
      ) : (
        <View style={styles.dordle}>
          <Wordle
            word={!foundsolution1 ? word : ''}
            row={row}
            guesses={guesses1}
          />
        </View>
      )}
      <Keyboard setChangeLetter={letterCallBack} keyboard={keyboard} />
      <View style={styles.row}>
        <View style={styles.returnButton}>
          <Button onPress={onReturnButton} title="←" />
        </View>
        <View style={styles.statsButton}>
          <Button onPress={changeShowStats} title={'STATISTICS'} />
        </View>
        <View style={styles.statsButton}>
          <Button onPress={changeShowClue} title="clue" />
        </View>
        {gameMode === 0 ? (
          row === 6 ? (
            <View style={styles.statsButton}>
              <Button onPress={changeShowCriticalClue} title="critical clue" />
            </View>
          ) : null
        ) : row === 5 ? (
          <View style={styles.statsButton}>
            <Button onPress={changeShowCriticalClue} title="critical clue" />
          </View>
        ) : null}
      </View>
    </View>
  );
};

// a starter component that displays two random words
export default function App() {
  const [settings, setSettings] = React.useState(true);
  const [gameMode, setGameMode] = React.useState();
  const [solution1, setSolution1] = React.useState('');
  const [solution2, setSolution2] = React.useState('');
  const [showStatistics, setShowStatistics] = React.useState(false);
  const [statistics, setStatistics] = React.useState();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const jsonValue: string | null = await AsyncStorage.getItem(
        '@storage_Key'
      );
      if (jsonValue === null) {
        setStatistics(resetStats());
      } else {
        setStatistics(jsonValue);
      }
    } catch (e) {
      // error reading value
    }
  };

  const onGameMode01 = (mysolution1: String) => {
    setSolution1(String(mysolution1));
    setGameMode(0);
    setSettings(false);
  };

  const onGameMode02 = (mysolution2: String) => {
    setSolution2(String(mysolution2));
    setGameMode(0);
    setSettings(false);
  };

  const onGameMode1 = (mysolution1: String) => {
    setSolution1(String(mysolution1));
    setGameMode(1);
    setSettings(false);
  };

  const onGameMode2 = (mysolution1: String) => {
    setSolution1(String(mysolution1));
    setGameMode(2);
    setSettings(false);
  };

  const onReturnButton = () => {
    setSettings(true);
  };

  const onShowStatistics: Callback0 = () => {
    getData();
    showStatistics ? setShowStatistics(false) : setShowStatistics(true);
  };

  return showStatistics ? (
    <Statistics changeShowStats={onShowStatistics} statisctics={statistics} />
  ) : (
    <View style={styles.container}>
      {settings ? (
        <Settings
          onGameMode01={onGameMode01}
          onGameMode02={onGameMode02}
          onGameMode1={onGameMode1}
          onGameMode2={onGameMode2}
          onShowSettings={onShowStatistics}
        />
      ) : (
        <GameScreen
          myGameMode={gameMode}
          onReturnButton={onReturnButton}
          mysolution1={solution1}
          mysolution2={solution2}
          statistics={statistics}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    fontFamily: 'Monospace',
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 5,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Monospace',
  },
  row: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 2,
    fontFamily: 'Monospace',
  },
  letter: {
    height: 35,
    width: 23,
    textAlign: 'center',
    fontSize: 20,
    borderWidth: 1,
    borderColor: 'black',
    margin: -1,
    borderRadius: 2,
    fontFamily: 'Monospace',
  },
  keyboardButton: {
    flexDirection: 'row',
    height: 40,
    width: 25,
    margin: 2,
    borderWidth: 1,
    textAlign: 'center',
    borderRadius: 2,
    fontSize: 17,
    backgroundColor: 'white',
    zIndex: 0,
    elevation: 0,
    fontFamily: 'Monospace',
  },
  keyboard: {
    marginTop: 25,
    fontFamily: 'Monospace',
  },
  dordle: {
    margin: 5,
    fontFamily: 'Monospace',
  },
  green: {
    backgroundColor: 'green',
  },
  yellow: {
    backgroundColor: 'yellow',
  },
  grey: {
    backgroundColor: 'grey',
  },
  white: {
    backgroundColor: 'white',
  },
  red: {
    backgroundColor: 'red',
  },
  greenButton: {
    height: 38,
    zIndex: 0,
    elevation: 0,
    backgroundColor: 'green',
    flex: 0.5,
    fontFamily: 'Monospace',
  },
  yellowButton: {
    height: 38,
    zIndex: 0,
    elevation: 0,
    backgroundColor: 'yellow',
    flex: 0.5,
    fontFamily: 'Monospace',
  },
  greyButton: {
    height: 38,
    elevation: 0,
    zIndex: 0,
    backgroundColor: 'grey',
    flex: 0.5,
    fontFamily: 'Monospace',
  },
  myPressable: {
    height: 40,
    width: 25,
    textAlign: 'center',
    zIndex: 2,
    elevation: 2,
    backgroundColor: 'transparent',
    position: 'absolute',
    fontFamily: 'Monospace',
  },
  gameTypeButton: {
    margin: 5,
    fontFamily: 'Monospace',
  },
  result: {
    textAlign: 'center',
    fontFamily: 'Monospace',
    fontSize: 16,
  },
  returnButton: {
    width: 50,
    marginLeft: 5,
    marginTop: 15,
    fontFamily: 'Monospace',
  },
  myletter: {
    margin: 2,
    fontFamily: 'Monospace',
  },
  statsButton: {
    marginLeft: 5,
    marginTop: 15,
    fontFamily: 'Monospace',
  },
  inputText: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontFamily: 'Monospace',
  },
  invalidInput: {
    color: 'red',
    textAlign: 'center',
    fontFamily: 'Monospace',
    margin: 15,
  },
  statistics: {
    margin: 20,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Monospace',
  },
});
