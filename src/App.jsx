import { useGame } from './hooks/useGame'
import GameSetup from './components/GameSetup'
import ScoreBoard from './components/ScoreBoard'

export default function App() {
  const game = useGame()

  if (!game.setup.started) {
    return <GameSetup onStart={game.startGame} />
  }

  return <ScoreBoard game={game} onReset={game.resetMatch} />
}
