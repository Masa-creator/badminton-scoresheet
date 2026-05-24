import { useState } from 'react'
import IntervalTimer from './IntervalTimer'
import styles from './ScoreBoard.module.css'

export default function ScoreBoard({ game, onReset }) {
  const {
    setup, currentSet, sets, setsWon, matchOver, matchWinner,
    service, addPoint, undoPoint, startNextSet,
  } = game

  const [showTimer, setShowTimer] = useState(false)
  const [timerConfig, setTimerConfig] = useState(null)
  const [prevSetJustFinished, setPrevSetJustFinished] = useState(false)

  const handleAddPoint = (player) => {
    if (!currentSet || currentSet.finished || matchOver) return
    addPoint(player)

    const newScores = [...(currentSet?.scores || [0, 0])]
    newScores[player] += 1
    const setNum = setsWon[0] + setsWon[1]

    if (setNum === 2) {
      const other = 1 - player
      if (newScores[player] === 11 && newScores[other] < 11) {
        setTimerConfig({ duration: 60, label: '第3ゲーム インターバル（11点）' })
        setShowTimer(true)
      }
    }
  }

  const handleSetFinished = () => {
    setPrevSetJustFinished(true)
    setTimerConfig({ duration: 120, label: 'セット間インターバル（2分）' })
    setShowTimer(true)
  }

  const handleTimerDone = () => {
    setShowTimer(false)
    if (prevSetJustFinished) {
      setPrevSetJustFinished(false)
      startNextSet()
    }
  }

  const lastSet = sets[sets.length - 1]
  const showSetResult = lastSet?.finished && !currentSet?.history?.length === false
    ? false
    : lastSet?.finished && currentSet?.history?.length === 0

  const isDeuceZone = currentSet && !currentSet.finished
    ? currentSet.scores[0] >= (setup.maxPoints - 1) && currentSet.scores[1] >= (setup.maxPoints - 1)
    : false

  const currentSetNum = sets.length + 1

  return (
    <div className={styles.container}>
      {showTimer && timerConfig && (
        <IntervalTimer
          duration={timerConfig.duration}
          label={timerConfig.label}
          onDone={handleTimerDone}
        />
      )}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.setLabel}>
            {matchOver ? '試合終了' : `第 ${currentSetNum} セット`}
          </span>
          {isDeuceZone && <span className={styles.deuceTag}>DEUCE</span>}
        </div>
        <div className={styles.setsWon}>
          <span className={styles.setsNum}>{setsWon[0]}</span>
          <span className={styles.setsDivider}>–</span>
          <span className={styles.setsNum}>{setsWon[1]}</span>
        </div>
        <button className={styles.resetBtn} onClick={onReset} title="リセット">
          ✕
        </button>
      </header>

      {matchOver ? (
        <MatchResult
          winner={matchWinner}
          players={setup.players}
          setsWon={setsWon}
          sets={sets}
          onReset={onReset}
        />
      ) : (
        <>
          <div className={styles.scoreArea}>
            <ScorePanel
              player={0}
              name={setup.players[0]}
              score={currentSet?.scores[0] ?? 0}
              isServing={service === 0}
              onScore={() => handleAddPoint(0)}
            />
            <div className={styles.scoreDivider}>
              <span className={styles.scoreColon}>:</span>
            </div>
            <ScorePanel
              player={1}
              name={setup.players[1]}
              score={currentSet?.scores[1] ?? 0}
              isServing={service === 1}
              onScore={() => handleAddPoint(1)}
            />
          </div>

          <div className={styles.controls}>
            <button
              className={styles.undoBtn}
              onClick={undoPoint}
              disabled={!currentSet?.history?.length}
            >
              ↩ 取り消し
            </button>

            {currentSet?.finished && !matchOver && (
              <button className={styles.nextSetBtn} onClick={() => {
                handleSetFinished()
              }}>
                次のセット →
              </button>
            )}

            {currentSet?.finished && !matchOver && (
              <div className={styles.setResultBanner}>
                <span className={styles.setResultText}>
                  {setup.players[currentSet.winner]} がセットを取得！
                </span>
              </div>
            )}
          </div>

          <ScoreHistory
            history={currentSet?.history ?? []}
            players={setup.players}
            maxPoints={setup.maxPoints}
          />
        </>
      )}
    </div>
  )
}

function ScorePanel({ player, name, score, isServing, onScore }) {
  return (
    <button
      className={`${styles.scorePanel} ${isServing ? styles.serving : ''}`}
      onClick={onScore}
      aria-label={`${name} に得点`}
    >
      <div className={styles.playerName}>
        {isServing && <span className={styles.serveIndicator}>▶</span>}
        <span>{name}</span>
      </div>
      <div className={styles.scoreNum}>{score}</div>
      <div className={styles.tapHint}>タップで得点</div>
    </button>
  )
}

function ScoreHistory({ history, players, maxPoints }) {
  if (!history.length) return null

  const reversed = [...history].reverse().slice(0, 30)

  return (
    <div className={styles.historyWrap}>
      <h3 className={styles.historyTitle}>得点履歴</h3>
      <div className={styles.historyList}>
        {reversed.map((entry, idx) => (
          <div key={idx} className={`${styles.historyItem} ${entry.player === 0 ? styles.leftPoint : styles.rightPoint}`}>
            <span className={styles.historyScore}>
              {entry.scores[0]} – {entry.scores[1]}
            </span>
            <span className={styles.historyPlayer}>{players[entry.player]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MatchResult({ winner, players, setsWon, sets, onReset }) {
  return (
    <div className={styles.matchResult}>
      <div className={styles.trophy}>🏆</div>
      <h2 className={styles.winnerName}>{players[winner]}</h2>
      <p className={styles.winnerLabel}>優勝！</p>
      <div className={styles.finalScore}>
        {setsWon[0]} – {setsWon[1]}
      </div>
      <div className={styles.setScores}>
        {sets.map((set, i) => (
          <div key={i} className={styles.setScore}>
            <span className={styles.setLabel2}>第{i + 1}セット</span>
            <span>{set.scores[0]} – {set.scores[1]}</span>
          </div>
        ))}
      </div>
      <button className={styles.newMatchBtn} onClick={onReset}>
        新しい試合
      </button>
    </div>
  )
}
