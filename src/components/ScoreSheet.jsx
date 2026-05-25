import { useRef, useEffect } from 'react'
import styles from './ScoreSheet.module.css'

function getTeamLabel(players, mode, teamIdx) {
  if (mode === 'singles') return players[teamIdx] ?? ''
  return `${players[teamIdx * 2] ?? ''}\n${players[teamIdx * 2 + 1] ?? ''}`
}

export default function ScoreSheet({ history, players, mode }) {
  const scrollRef = useRef(null)

  // 新しい点が入ったら右端へ自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [history.length])

  const labelA = getTeamLabel(players, mode, 0)
  const labelB = getTeamLabel(players, mode, 1)

  return (
    <div className={styles.wrap}>
      <div className={styles.titleRow}>
        <span className={styles.title}>📋 スコアシート</span>
        <span className={styles.legend}>
          <span className={styles.legendServe}>●</span>サーブ側
          <span className={styles.legendReceive}>○</span>レシーブ側
        </span>
      </div>

      <div className={styles.tableWrap} ref={scrollRef}>
        <table className={styles.table}>
          <tbody>
            {/* チームA の行 */}
            <tr>
              <td className={`${styles.nameCell} ${styles.nameCellA}`}>
                {labelA.split('\n').map((t, i) => <span key={i} className={styles.nameLine}>{t}</span>)}
              </td>
              {history.map((entry, i) => {
                const scored = entry.scoringTeam === 0
                const served = entry.serverInfo.servingTeam === 0
                return (
                  <td key={i} className={`${styles.cell} ${scored ? (served ? styles.serveCell : styles.receiveCell) : styles.emptyCell}`}>
                    {scored ? entry.scores[0] : ''}
                  </td>
                )
              })}
            </tr>

            {/* チームB の行 */}
            <tr>
              <td className={`${styles.nameCell} ${styles.nameCellB}`}>
                {labelB.split('\n').map((t, i) => <span key={i} className={styles.nameLine}>{t}</span>)}
              </td>
              {history.map((entry, i) => {
                const scored = entry.scoringTeam === 1
                const served = entry.serverInfo.servingTeam === 1
                return (
                  <td key={i} className={`${styles.cell} ${scored ? (served ? styles.serveCell : styles.receiveCell) : styles.emptyCell}`}>
                    {scored ? entry.scores[1] : ''}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
