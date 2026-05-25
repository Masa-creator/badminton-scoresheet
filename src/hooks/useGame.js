import { useState, useCallback } from 'react'

function checkGameOver(scores, maxPoints) {
  const maxCap = maxPoints === 21 ? 30 : 17
  for (let i = 0; i < 2; i++) {
    const other = 1 - i
    if (scores[i] >= maxPoints && scores[i] - scores[other] >= 2) return i
    if (scores[i] >= maxCap) return i
  }
  return null
}

// Returns { servingTeam, servingPlayerIdx, receivingTeam, receivingPlayerIdx, courtSide }
export function getServerInfo(serviceState, scores, mode) {
  if (mode === 'singles') {
    return {
      servingTeam: serviceState.team,
      servingPlayerIdx: 0,
      receivingTeam: 1 - serviceState.team,
      receivingPlayerIdx: 0,
      courtSide: null,
    }
  }
  const { team, rightCourt } = serviceState
  const isEven = scores[team] % 2 === 0
  const servingPlayerIdx = isEven ? rightCourt[team] : 1 - rightCourt[team]
  const courtSide = isEven ? 'right' : 'left'
  const receivingTeam = 1 - team
  // Receiver is in the same-named court as the server (cross-court diagonal)
  const receivingPlayerIdx = isEven ? rightCourt[receivingTeam] : 1 - rightCourt[receivingTeam]
  return { servingTeam: team, servingPlayerIdx, receivingTeam, receivingPlayerIdx, courtSide }
}

const initialSet = (maxPoints) => ({
  scores: [0, 0],
  history: [],
  finished: false,
  winner: null,
  maxPoints,
})

export function useGame() {
  const [setup, setSetup] = useState({ started: false })
  const [sets, setSets] = useState([])
  const [setsWon, setSetsWon] = useState([0, 0])
  const [currentSet, setCurrentSet] = useState(null)
  const [matchOver, setMatchOver] = useState(false)
  const [matchWinner, setMatchWinner] = useState(null)
  // serviceState: { team: 0|1, rightCourt: [playerIdxInRightForTeam0, playerIdxInRightForTeam1] }
  const [serviceState, setServiceState] = useState({ team: 0, rightCourt: [0, 0] })

  const startGame = useCallback((config) => {
    setSetup({ ...config, started: true })
    setCurrentSet(initialSet(config.maxPoints))
    setSets([])
    setSetsWon([0, 0])
    setMatchOver(false)
    setMatchWinner(null)
    setServiceState({ team: 0, rightCourt: [0, 0] })
  }, [])

  const addPoint = useCallback((scoringTeam) => {
    if (!currentSet || currentSet.finished || matchOver) return

    setCurrentSet((prev) => {
      const newScores = [...prev.scores]
      newScores[scoringTeam] += 1

      const serverInfo = getServerInfo(serviceState, prev.scores, setup.mode)
      const entry = { scoringTeam, scores: [...newScores], serverInfo, serviceStateBefore: { ...serviceState, rightCourt: [...serviceState.rightCourt] } }
      const newHistory = [...prev.history, entry]

      // Update service state
      if (scoringTeam === serviceState.team) {
        // Serving team scored → swap their courts
        setServiceState((s) => {
          const rc = [...s.rightCourt]
          rc[scoringTeam] = 1 - rc[scoringTeam]
          return { ...s, rightCourt: rc }
        })
      } else {
        // Receiving team scored → service changes, no swap
        setServiceState((s) => ({ ...s, team: scoringTeam }))
      }

      const winner = checkGameOver(newScores, prev.maxPoints)
      if (winner !== null) {
        const finishedSet = { ...prev, scores: newScores, history: newHistory, finished: true, winner }
        setSets((ps) => [...ps, finishedSet])
        setSetsWon((pw) => {
          const u = [...pw]
          u[winner] += 1
          if (u[0] >= 2 || u[1] >= 2) {
            setMatchOver(true)
            setMatchWinner(u[0] >= 2 ? 0 : 1)
          }
          return u
        })
        return finishedSet
      }
      return { ...prev, scores: newScores, history: newHistory }
    })
  }, [currentSet, matchOver, serviceState, setup.mode])

  const undoPoint = useCallback(() => {
    if (!currentSet || currentSet.finished || !currentSet.history.length) return

    setCurrentSet((prev) => {
      const newHistory = prev.history.slice(0, -1)
      const lastEntry = prev.history[prev.history.length - 1]
      const newScores = newHistory.length > 0
        ? [...newHistory[newHistory.length - 1].scores]
        : [0, 0]

      // Restore service state from before this point
      setServiceState({ ...lastEntry.serviceStateBefore, rightCourt: [...lastEntry.serviceStateBefore.rightCourt] })

      return { ...prev, scores: newScores, history: newHistory }
    })
  }, [currentSet])

  const startNextSet = useCallback(() => {
    if (matchOver) return
    setCurrentSet(initialSet(setup.maxPoints))
    // Keep current service state (player who last scored serves first)
  }, [matchOver, setup.maxPoints])

  const resetMatch = useCallback(() => {
    setSetup((p) => ({ ...p, started: false }))
    setCurrentSet(null)
    setSets([])
    setSetsWon([0, 0])
    setMatchOver(false)
    setMatchWinner(null)
    setServiceState({ team: 0, rightCourt: [0, 0] })
  }, [])

  const serverInfo = currentSet && !currentSet.finished
    ? getServerInfo(serviceState, currentSet.scores, setup.mode)
    : null

  // 第3ゲーム 11点インターバル判定
  const isThirdGameInterval = currentSet && !currentSet.finished
    && (setsWon[0] + setsWon[1] === 2)
    && currentSet.history.length > 0
    && (currentSet.scores[0] === 11 || currentSet.scores[1] === 11)
    && Math.abs(currentSet.scores[0] - currentSet.scores[1]) > 0
    && (currentSet.history[currentSet.history.length - 1]?.scores[0] === 11
      || currentSet.history[currentSet.history.length - 1]?.scores[1] === 11)

  return {
    setup,
    currentSet,
    sets,
    setsWon,
    matchOver,
    matchWinner,
    serviceState,
    serverInfo,
    startGame,
    addPoint,
    undoPoint,
    startNextSet,
    resetMatch,
  }
}
