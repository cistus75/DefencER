import { GameProvider } from './app/GameProvider'
import { GameScreen } from './ui/GameScreen'

export default function App() {
  return <GameProvider><GameScreen /></GameProvider>
}
