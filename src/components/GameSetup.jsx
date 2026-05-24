import { useState } from 'react'
import styles from './GameSetup.module.css'

export default function GameSetup({ onStart }) {
  const [mode, setMode] = useState('singles')
  const [maxPoints, setMaxPoints] = useState(21)
  const [players, setPlayers] = useState(['チーム A', 'チーム B'])

  const handleSubmit = (e) => {
    e.preventDefault()
    onStart({ mode, maxPoints: Number(maxPoints), players })
  }

  const updatePlayer = (idx, val) => {
    const updated = [...players]
    updated[idx] = val
    setPlayers(updated)
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
            <button
              type="button"
              className={`${styles.toggleBtn} ${mode === 'singles' ? styles.active : ''}`}
              onClick={() => setMode('singles')}
            >
              シングルス
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${mode === 'doubles' ? styles.active : ''}`}
              onClick={() => setMode('doubles')}
            >
              ダブルス
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>ゲームポイント</label>
          <div className={styles.toggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${maxPoints === 21 ? styles.active : ''}`}
              onClick={() => setMaxPoints(21)}
            >
              21点制
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${maxPoints === 15 ? styles.active : ''}`}
              onClick={() => setMaxPoints(15)}
            >
              15点制
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>チーム名</label>
          <div className={styles.playerInputs}>
            <input
              className={styles.input}
              value={players[0]}
              onChange={(e) => updatePlayer(0, e.target.value)}
              placeholder="チーム A"
              maxLength={12}
            />
            <span className={styles.vs}>VS</span>
            <input
              className={styles.input}
              value={players[1]}
              onChange={(e) => updatePlayer(1, e.target.value)}
              placeholder="チーム B"
              maxLength={12}
            />
          </div>
        </div>

        <div className={styles.rules}>
          <p>ベスト3セット • {maxPoints}点制 • デュース {maxPoints === 21 ? '(最大30点)' : '(最大17点)'}</p>
        </div>

        <button type="submit" className={styles.startBtn}>
          試合開始
        </button>
      </form>
    </div>
  )
}
