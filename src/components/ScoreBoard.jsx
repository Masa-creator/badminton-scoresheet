import { useState, useEffect } from 'react'
import IntervalTimer from './IntervalTimer'
import ScoreSheet from './ScoreSheet'
import styles from './ScoreBoard.module.css'

function getPlayerName(players, mode, teamIdx, playerIdx = 0) {
  if (mode === 'singles') return players[teamIdx] ?? ''
  return players[teamIdx * 2 + playerIdx] ?? ''
}

function getTeamShortName(players, mode, teamIdx) {
  if (mode === 'singles') return players[teamIdx] ?? ''
  const p1 = players[teamIdx * 2] ?? ''
  const p2 = players[teamIdx * 2 + 1] ?? ''
  return `${p1} / ${p2}`
}

export default function ScoreBoard({ game, onReset }) {
  const {
    setup, currentSet, sets, setsWon, matchOver, matchWinner,
    serverInfo, addPoint, undoPoint, startNextSet,
  } = game

  const [timerConfig, setTimerConfig] = useState(null)
  const [awaitingNextSet, setAwaitingNextSet] = useState(false)
  const [shownIntervalKey, setShownIntervalKey] = useState(null)

  // Detect 3rd game interval at 11 points
  useEffect(() => {
    if (!currentSet || currentSet.finished) return
    const h = currentSet.history
    if (!h.length) return
    const last = h[h.length - 1]
    const isThirdGame = setsWon[0] + setsWon[1] === 2
    if (!isThirdGame) return
    const s = last.scores
    const intervalKey = `g3-${s[0]}-${s[1]}`
    if (shownIntervalKey === intervalKey) return
    if ((s[0] === 11 && s[1] < 11) || (s[1] === 11 && s[0] < 11)) {
      setShownIntervalKey(intervalKey)
      setTimerConfig({ duration: 60, label: '第3ゲーム インターバル（11点）' })
    }
  }, [currentSet?.history?.length])

  const handleAddPoint = (team) => {
    if (!currentSet || currentSet.finished || matchOver) return
    addPoint(team)
  }

  const handleSetFinished = () => {
    if (matchOver) return
    setAwaitingNextSet(false)
    setTimerConfig({ duration: 120, label: 'セット間インターバル（2分）' })
  }

  const handleTimerDone = () => {
    const wasSetInterval = timerConfig?.duration === 120
    setTimerConfig(null)
    if (wasSetInterval) {
      startNextSet()
    }
  }

  const setFinishedBanner = currentSet?.finished && !matchOver

  const isDeuceZone = currentSet && !currentSet.finished
    ? currentSet.scores[0] >= (setup.maxPoints - 1) && currentSet.scores[1] >= (setup.maxPoints - 1)
    : false

  const currentSetNum = sets.length + 1

  return (
    <div className={styles.page}>
      {timerConfig && (
        <IntervalTimer
          duration={timerConfig.duration}
          label={timerConfig.label}
          onDone={handleTimerDone}
        />
      )}

      {/* ─── Header ─── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.setLabel}>
            {matchOver ? '試合終了' : `第 ${currentSetNum} セット`}
          </span>
          {isDeuceZone && <span className={styles.deuceTag}>DEUCE</span>}
        </div>
        <div className={styles.setsWon}>
          <span className={`${styles.setsNum} ${styles.setsNumA}`}>{setsWon[0]}</span>
          <span className={styles.setsDash}>–</span>
          <span className={`${styles.setsNum} ${styles.setsNumB}`}>{setsWon[1]}</span>
        </div>
        <button className={styles.resetBtn} onClick={onReset} aria-label="リセット">✕</button>
      </header>

      {matchOver ? (
        <MatchResult
          winner={matchWinner}
          players={setup.players}
          mode={setup.mode}
          setsWon={setsWon}
          sets={sets}
          onReset={onReset}
        />
      ) : (
        <>
          {/* ─── Score panels ─── */}
          <div className={styles.scoreRow}>
            <ScorePanel
              teamIdx={0}
              players={setup.players}
              mode={setup.mode}
              score={currentSet?.scores[0] ?? 0}
              serverInfo={serverInfo}
              disabled={currentSet?.finished}
              onScore={() => handleAddPoint(0)}
            />
            <div className={styles.divider} />
            <ScorePanel
              teamIdx={1}
              players={setup.players}
              mode={setup.mode}
              score={currentSet?.scores[1] ?? 0}
              serverInfo={serverInfo}
              disabled={currentSet?.finished}
              onScore={() => handleAddPoint(1)}
            />
          </div>

          {/* ─── Service info (doubles) ─── */}
          {setup.mode === 'doubles' && serverInfo && !currentSet?.finished && (
            <ServiceInfo serverInfo={serverInfo} players={setup.players} mode={setup.mode} />
          )}

          {/* ─── Set finished banner ─── */}
          {setFinishedBanner && (
            <div className={styles.setFinishedBanner}>
              <span className={styles.setFinishedText}>
                🏆 {getTeamShortName(setup.players, setup.mode, currentSet.winner)} がセット取得！
              </span>
              <button className={styles.nextSetBtn} onClick={handleSetFinished}>
                次のセットへ →
              </button>
            </div>
          )}

          {/* ─── Controls ─── */}
          <div className={styles.controls}>
            <button
              className={styles.undoBtn}
              onClick={undoPoint}
              disabled={!currentSet?.history?.length || currentSet?.finished}
            >
              ↩ 取り消し
            </button>
          </div>

          {/* ─── Score sheet ─── */}
          <ScoreSheet
            history={currentSet?.history ?? []}
            players={setup.players}
            mode={setup.mode}
          />
        </>
      )}
    </div>
  )
}

// ─── ScorePanel ───────────────────────────────────────────────────────────────

function ScorePanel({ teamIdx, players, mode, score, serverInfo, disabled, onScore }) {
  const isServing = serverInfo?.servingTeam === teamIdx
  const isReceiving = serverInfo?.receivingTeam === teamIdx

  // Which players to show
  const p1 = getPlayerName(players, mode, teamIdx, 0)
  const p2 = mode === 'doubles' ? getPlayerName(players, mode, teamIdx, 1) : null

  // Doubles: figure out which player is server/receiver
  const servingPlayerIdx = isServing ? serverInfo.servingPlayerIdx : null
  const receivingPlayerIdx = isReceiving ? serverInfo.receivingPlayerIdx : null

  return (
    <button
      className={`${styles.panel} ${isServing ? styles.panelServing : ''} ${disabled ? styles.panelDisabled : ''}`}
      onClick={disabled ? undefined : onScore}
      aria-label={`${p1}に得点`}
    >
      <div className={styles.playerNames}>
        {mode === 'doubles' ? (
          <>
            <PlayerBadge
              name={p1}
              role={servingPlayerIdx === 0 ? 'serve' : receivingPlayerIdx === 0 ? 'receive' : null}
              courtSide={servingPlayerIdx === 0 || receivingPlayerIdx === 0
                ? (serverInfo?.courtSide === 'right' ? '右' : '左') : null}
            />
            <PlayerBadge
              name={p2}
              role={servingPlayerIdx === 1 ? 'serve' : receivingPlayerIdx === 1 ? 'receive' : null}
              courtSide={servingPlayerIdx === 1 || receivingPlayerIdx === 1
                ? (serverInfo?.courtSide === 'right' ? '左' : '右') : null}
            />
          </>
        ) : (
          <div className={styles.singleName}>
            {isServing && <span className={styles.serveArrow}>🏸</span>}
            <span>{p1}</span>
          </div>
        )}
      </div>

      <div className={`${styles.scoreNum} ${isServing ? styles.scoreServing : ''}`}>
        {score}
      </div>

      {!disabled && <div className={styles.tapHint}>タップで得点</div>}
    </button>
  )
}

function PlayerBadge({ name, role, courtSide }) {
  return (
    <div className={`${styles.playerBadge} ${role === 'serve' ? styles.badgeServe : role === 'receive' ? styles.badgeReceive : ''}`}>
      <span className={styles.badgeName}>{name}</span>
      {role === 'serve' && (
        <span className={styles.badgeRole}>🏸 サーブ{courtSide ? `(${courtSide})` : ''}</span>
      )}
      {role === 'receive' && (
        <span className={styles.badgeRole}>← レシーブ{courtSide ? `(${courtSide})` : ''}</span>
      )}
    </div>
  )
}

// ─── ServiceInfo (doubles only) ───────────────────────────────────────────────

function ServiceInfo({ serverInfo, players, mode }) {
  const serverName = getPlayerName(players, mode, serverInfo.servingTeam, serverInfo.servingPlayerIdx)
  const receiverName = getPlayerName(players, mode, serverInfo.receivingTeam, serverInfo.receivingPlayerIdx)
  const courtLabel = serverInfo.courtSide === 'right' ? '右コート' : '左コート'

  return (
    <div className={styles.serviceInfo}>
      <div className={styles.serviceRow}>
        <span className={styles.serviceIcon}>🏸</span>
        <span className={styles.serviceName}>{serverName}</span>
        <span className={styles.serviceCourt}>{courtLabel}からサーブ</span>
      </div>
      <span className={styles.serviceArrow}>→</span>
      <div className={styles.serviceRow}>
        <span className={styles.serviceName}>{receiverName}</span>
        <span className={styles.serviceCourt}>がレシーブ</span>
      </div>
    </div>
  )
}

// ─── MatchResult ──────────────────────────────────────────────────────────────

function MatchResult({ winner, players, mode, setsWon, sets, onReset }) {
  const winnerName = getTeamShortName(players, mode, winner)
  return (
    <div className={styles.matchResult}>
      <div className={styles.trophy}>🏆</div>
      <p className={styles.winnerLabel}>優勝</p>
      <h2 className={styles.winnerName}>{winnerName}</h2>
      <div className={styles.finalScore}>{setsWon[0]} – {setsWon[1]}</div>
      <div className={styles.setScores}>
        {sets.map((set, i) => (
          <div key={i} className={styles.setScoreItem}>
            <span className={styles.setLabel2}>第{i + 1}セット</span>
            <span className={styles.setScoreVal}>{set.scores[0]} – {set.scores[1]}</span>
          </div>
        ))}
      </div>
      <button className={styles.newMatchBtn} onClick={onReset}>新しい試合</button>
    </div>
  )
}
