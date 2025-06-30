let isAppInit = false;
let oscillator, gainNode;
const AudioContext = window.AudioContext;
const appContents = document.querySelector('.app-contents');
appContents.style.display = 'block';

const sliderFreq = document.getElementById('freq');
const sliderVol = document.getElementById('vol');
const sliderValueDisplay = document.getElementById('freq-value');
const outputTextDisplay = document.getElementById('outputText');

const maxFreq = 1040;
const maxVol = 0.2;
const initialVol = 0.05;
const noteNames = ["ド", "ド#", "レ", "レ#", "ミ", "ファ", "ファ#", "ソ", "ソ#", "ラ", "ラ#", "シ"];
const noteColors = { "ド": "red", "ド#": "orange", "レ": "yellow", "レ#": "limegreen", "ミ": "green", "ファ": "cyan", "ファ#": "blue", "ソ": "indigo", "ソ#": "violet", "ラ": "pink", "ラ#": "salmon", "シ": "gold" };
const r = Math.pow(2, 1 / 12);
let play_flag = 0; // 0: 停止中, 1: 再生中

window.onload = () => {
  document.addEventListener('mousemove', (event) => {
    const frequency = 260 + (event.clientX / window.innerWidth) * (maxFreq - 260);
    const volume = maxVol - (event.clientY / window.innerHeight) * maxVol;

    if (oscillator && play_flag === 1) {
      oscillator.frequency.value = frequency;
    }
    if (gainNode && play_flag === 1) {
      gainNode.gain.value = volume;
    }

    sliderFreq.value = frequency;
    sliderValueDisplay.textContent = `${Math.round(frequency)} `;

    const noteName = scaleOutput(frequency);
    outputTextDisplay.textContent = noteName;

    const highlight = document.querySelector('.cursor-highlight');
    highlight.style.backgroundColor = noteColors[noteName] || "white";
  });
};

function init() {
  if (isAppInit) return;

  const audioCtx = new AudioContext();

  window.onclick = async () => {
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    toggleSound(); // クリックで音を切り替え
  };

  window.addEventListener('keydown', toggleSound); // キー操作で音を切り替え

  oscillator = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();
  //音量の調整 音量を0（無音）から1（最大音量）の間で設定
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime); // 初期状態は音量ゼロ

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();

  isAppInit = true;
}

function toggleSound() {
  if (!gainNode) return;

  if (play_flag === 0) {
    // 音を再生
    gainNode.gain.setValueAtTime(initialVol, 0); // 音量を元に戻す
    play_flag = 1;
  } else {
    // 音を停止
    gainNode.gain.setValueAtTime(0, 0); // 音量をゼロにする
    play_flag = 0;
  }
}

function scaleOutput(value) {
  let frequency = 27.5;
  let index = 9;
  while (frequency <= value) {
    frequency *= r;
    index++;
  }
  // 音階が１２個しかないから、インデックスを12で割って音階の名前を取得
  return noteNames[index % 12];
}

document.addEventListener('mousemove', function (event) {
  const highlight = document.querySelector('.cursor-highlight');
  
  // カーソル位置を取得してハイライトを移動
  highlight.style.left = `${event.pageX}px`;
  highlight.style.top = `${event.pageY}px`;

  // 現在の周波数に基づいて音階を取得
  const frequency = parseFloat(sliderFreq.value); // スライダーの値を取得
  const noteName = scaleOutput(frequency);

  // 音階に応じた色を設定
  const color = noteColors[noteName] || "white"; // 対応する色がない場合は白
  highlight.style.backgroundColor = color;
});


window.addEventListener('click', init);
