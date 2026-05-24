import { useState, useCallback } from 'react'

const initialGameState = (maxPoints) => ({
  scores: [0, 0],
  history: [],
  finished: false,
  winner: null,
  maxPoints,
})

function checkGameOver(scores, maxPoints) {
  const deucePoint = maxPoints - 1
  const maxCap = maxPoints === 21 ? 30 : 17
  for (let i = 0; i < 2; i++) {
    const other = 1 - i
    if (scores[i] >= maxPoints && scores[i] - scores[other] >= 2) return i
    if (scores[i] >= maxCap) return i
  }
  return null
}

export function useGame() {
  const [setup, setSetup] = useState({
    mode: 'singles',
    maxPoints: 21,
    players: ['チーム A', 'チーム B'],
    started: false,
  })

  const [sets, setSets] = useState([])
  const [setsWon, setSetsWon] = useState([0, 0])
  const [currentSet, setCurrentSet] = useState(null)
  const [matchOver, setMatchOver] = useState(false)
  const [matchWinner, setMatchWinner] = useState(null)
  const [service, setService] = useState(0)

  const startGame = useCallback((config) => {
    const newSet = initialGameState(config.maxPoints)
    setSetup({ ...config, started: true })
    setCurrentSet(newSet)
    setSets([])
    setSetsWon([0, 0])
    setMatchOver(false)
    setMatchWinner(null)
    setService(0)
  }, [])

  const addPoint = useCallback((player) => {
    if (!currentSet || currentSet.finished || matchOver) return null

    setCurrentSet((prev) => {
      const newScores = [...prev.scores]
      newScores[player] += 1
      const newHistory = [...prev.history, { player, scores: [...newScores] }]

      const winner = checkGameOver(newScores, prev.maxPoints)

      if (winner !== null) {
        const newSet = { ...prev, scores: newScores, history: newHistory, finished: true, winner }

        setSets((prevSets) => {
          const updatedSets = [...prevSets, newSet]
          return updatedSets
        })

        setSetsWon((prev) => {
          const updated = [...prev]
          updated[winner] += 1
          const newWon = updated

          if (newWon[0] >= 2 || newWon[1] >= 2) {
            setMatchOver(true)
            setMatchWinner(newWon[0] >= 2 ? 0 : 1)
          }

          return updated
        })

        return { ...newSet, justFinished: true }
      }

      setService(player)
      return { ...prev, scores: newScores, history: newHistory }
    })

    return null
  }, [currentSet, matchOver])

  const undoPoint = useCallback(() => {
    if (!currentSet || currentSet.finished) return

    setCurrentSet((prev) => {
      if (prev.history.length === 0) return prev
      const newHistory = prev.history.slice(0, -1)
      const lastEntry = newHistory[newHistory.length - 1]
      const newScores = lastEntry ? [...lastEntry.scores] : [0, 0]

      const prevServer = newHistory.length > 0
        ? newHistory[newHistory.length - 1].player
        : 0
      setService(prevServer)

      return { ...prev, scores: newScores, history: newHistory }
    })
  }, [currentSet])

  const startNextSet = useCallback(() => {
    if (matchOver) return
    const newSet = initialGameState(setup.maxPoints)
    setCurrentSet(newSet)
    setService(setsWon[0] + setsWon[1] === 2 ? service : service)
  }, [matchOver, setup.maxPoints, setsWon, service])

  const resetMatch = useCallback(() => {
    setSetup((prev) => ({ ...prev, started: false }))
    setCurrentSet(null)
    setSets([])
    setSetsWon([0, 0])
    setMatchOver(false)
    setMatchWinner(null)
    setService(0)
  }, [])

  const isInterval = currentSet && !currentSet.finished
    ? (setsWon[0] + setsWon[1] === 2 && currentSet.scores[0] === 11 && currentSet.scores[1] < 11)
      || (setsWon[0] + setsWon[1] === 2 && currentSet.scores[1] === 11 && currentSet.scores[0] < 11)
    : false

  return {
    setup,
    currentSet,
    sets,
    setsWon,
    matchOver,
    matchWinner,
    service,
    isInterval,
    startGame,
    addPoint,
    undoPoint,
    startNextSet,
    resetMatch,
  }
}
