import { useState } from 'react'
import styles from './GameSetup.module.css'

const DEFAULT_SINGLES = ['選手 A', '選手 B']
const DEFAULT_DOUBLES = ['選手 A1', '選手 A2', '選手 B1', '選手 B2']

export default function GameSetup({ onStart }) {
  const [mode, setMode] = useState('singles')
  const [maxPoints, setMaxPoints] = useState(21)
  const [players, setPlayers] = useState([...DEFAULT_SINGLES, ...DEFAULT_DOUBLES])

  const updatePlayer = (idx, val) => {
    const updated = [...players]
    updated[idx] = val
    setPlayers(updated)
  }

  const handleModeChange = (newMode) => setMode(newMode)

  const handleSubmit = (e) => {
    e.preventDefault()
    const activePlayers = mode === 'singles'
      ? [players[0] || '選手 A', players[1] || '選手 B']
      : [players[2] || '選手 A1', players[3] || '選手 A2', players[4] || '選手 B1', players[5] || '選手 B2']
    onStart({ mode, maxPoints: Number(maxPoints), players: activePlayers })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>🏸</span>
        <h1 className={styles.title}>バドミントン<br />スコアシート</h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <label className={styles.label}>試合形式</label>
          <div className={styles.toggle}>
            <button type="button"
              className={`${styles.toggleBtn} ${mode === 'singles' ? styles.active : ''}`}
              onClick={() => handleModeChange('singles')}>
              シングルス
            </button>
            <button type="button"
              className={`${styles.toggleBtn} ${mode === 'doubles' ? styles.active : ''}`}
              onClick={() => handleModeChange('doubles')}>
              ダブルス
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>ゲームポイント</label>
          <div className={styles.toggle}>
            <button type="button"
              className={`${styles.toggleBtn} ${maxPoints === 21 ? styles.active : ''}`}
              onClick={() => setMaxPoints(21)}>
              21点制
            </button>
            <button type="button"
              className={`${styles.toggleBtn} ${maxPoints === 15 ? styles.active : ''}`}
              onClick={() => setMaxPoints(15)}>
              15点制
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>選手名</label>
          {mode === 'singles' ? (
            <div className={styles.singlesInputs}>
              <div className={styles.playerRow}>
                <span className={styles.playerTag} style={{ background: 'var(--accent-blue)' }}>A</span>
                <input className={styles.input} value={players[0]}
                  onChange={(e) => updatePlayer(0, e.target.value)}
                  placeholder="選手 A" maxLength={10} />
              </div>
              <div className={styles.vsDivider}>VS</div>
              <div className={styles.playerRow}>
                <span className={styles.playerTag} style={{ background: 'var(--accent-red)' }}>B</span>
                <input className={styles.input} value={players[1]}
                  onChange={(e) => updatePlayer(1, e.target.value)}
                  placeholder="選手 B" maxLength={10} />
              </div>
            </div>
          ) : (
            <div className={styles.doublesInputs}>
              <div className={styles.doublesTeam}>
                <div className={styles.teamHeader} style={{ color: 'var(--accent-blue)' }}>チーム A</div>
                <div className={styles.playerRow}>
                  <span className={styles.playerTag} style={{ background: 'var(--accent-blue)' }}>A1</span>
                  <input className={styles.input} value={players[2]}
                    onChange={(e) => updatePlayer(2, e.target.value)}
                    placeholder="選手 A1" maxLength={8} />
                </div>
                <div className={styles.playerRow}>
                  <span className={styles.playerTag} style={{ background: 'rgba(30,144,255,0.5)' }}>A2</span>
                  <input className={styles.input} value={players[3]}
                    onChange={(e) => updatePlayer(3, e.target.value)}
                    placeholder="選手 A2" maxLength={8} />
                </div>
              </div>
              <div className={styles.vsDivider}>VS</div>
              <div className={styles.doublesTeam}>
                <div className={styles.teamHeader} style={{ color: 'var(--accent-red)' }}>チーム B</div>
                <div className={styles.playerRow}>
                  <span className={styles.playerTag} style={{ background: 'var(--accent-red)' }}>B1</span>
                  <input className={styles.input} value={players[4]}
                    onChange={(e) => updatePlayer(4, e.target.value)}
                    placeholder="選手 B1" maxLength={8} />
                </div>
                <div className={styles.playerRow}>
                  <span className={styles.playerTag} style={{ background: 'rgba(255,71,87,0.5)' }}>B2</span>
                  <input className={styles.input} value={players[5]}
                    onChange={(e) => updatePlayer(5, e.target.value)}
                    placeholder="選手 B2" maxLength={8} />
                </div>
              </div>
            </div>
          )}
        </div>

        {mode === 'doubles' && (
          <div className={styles.doublesNote}>
            <span>🏸</span>
            <span>A1・B1 が最初にサーブ/レシーブ担当（右コート）</span>
          </div>
        )}

        <div className={styles.rules}>
          {maxPoints}点制 • デュース • ベスト3セット
          {maxPoints === 21 ? ' • 最大30点' : ' • 最大17点'}
        </div>

        <button type="submit" className={styles.startBtn}>試合開始</button>
      </form>
    </div>
  )
}
