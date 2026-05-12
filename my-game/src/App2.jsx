import { useEffect, useRef } from 'react'

export default function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'

    const keys = {}

    const player = {
      x: 400,
      y: 500,
      width: 50,
      height: 50,
      speed: 7,
    }

    const bullets = []
    const enemyBullets = []
    const enemies = []

    let score = 0
    let gameOver = false

    const items = []

    let shootInterval = 200
    let playerPower = 1
    const maxPlayerPower = 5
    let homingPower = 0
    const maxHomingPower = 5
    let nextBossScore = 500
    const baseBossHp = 25
    let currentBossHp = baseBossHp
    let lastBossShotAt = 0
    const bossShootInterval = 1200
    let lastEnemyShotAt = 0
    const enemyShootInterval = 1400

    // 적 생성
    const spawnEnemy = () => {
      enemies.push({
        x: Math.random() * 750,
        y: -50,
        width: 40,
        height: 40,
        speed: 2 + Math.random() * 3,
      })
    }

    const spawnBoss = () => {
      enemies.push({
        x: 340,
        y: -140,
        width: 120,
        height: 120,
        speed: 1.2,
        hp: currentBossHp,
        type: 'boss',
      })

      currentBossHp = Math.ceil(currentBossHp * 1.3)
    }

    const enemySpawnIntervalId = setInterval(spawnEnemy, 1000)

    const resetGame = () => {
      score = 0
      gameOver = false
      shootInterval = 200
      playerPower = 1
      homingPower = 0
      nextBossScore = 500
      currentBossHp = baseBossHp
      lastBossShotAt = 0
      lastEnemyShotAt = 0
      lastShotAt = 0

      player.x = 400
      player.y = 500

      bullets.length = 0
      enemyBullets.length = 0
      enemies.length = 0
      items.length = 0

      Object.keys(keys).forEach((key) => {
        keys[key] = false
      })
    }

    // 키 입력
    const keyDown = (e) => {
      if (e.code === 'Space' && gameOver) {
        e.preventDefault()
        resetGame()
        return
      }

      keys[e.code] = true
    }

    const keyUp = (e) => {
      keys[e.code] = false
    }

    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)

    // 총알 발사
    const shoot = () => {
      const bulletCount = Math.min(playerPower, maxPlayerPower)
      const bulletWidth = 10

      for (let i = 0; i < bulletCount; i++) {
        const gap =
          bulletCount === 1
            ? 0
            : i * ((player.width - bulletWidth) / (bulletCount - 1))

        bullets.push({
          x: player.x + gap,
          y: player.y,
          width: bulletWidth,
          height: 20,
          speed: 10,
          type: 'normal',
        })
      }

      for (let i = 0; i < homingPower; i++) {
        bullets.push({
          x: player.x + player.width / 2 - 6 + i * 3 - homingPower,
          y: player.y - 8,
          width: 12,
          height: 12,
          speed: 7,
          vx: 0,
          vy: -7,
          type: 'homing',
        })
      }
    }

    // 충돌
    const collision = (a, b) => {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      )
    }

    let lastShotAt = 0

    // 업데이트
    const update = () => {
      if (gameOver) return

      // 이동
      if (keys['ArrowLeft']) {
        player.x -= player.speed
      }

      if (keys['ArrowRight']) {
        player.x += player.speed
      }

      if (keys['ArrowUp']) {
        player.y -= player.speed
      }

      if (keys['ArrowDown']) {
        player.y += player.speed
      }

      // 화면 제한
      if (player.x < 0) player.x = 0
      if (player.x > 750) player.x = 750

      if (player.y < 0) player.y = 0
      if (player.y > 550) player.y = 550

      items.forEach((item, itemIndex) => {

        item.y += 3

        // 플레이어 획득
        if (collision(player, item)) {

          if (item.type === 'power') {
            if (playerPower < maxPlayerPower) {
              playerPower += 1
            } else {
              homingPower = Math.min(homingPower + 1, maxHomingPower)
            }
          }

          items.splice(itemIndex, 1)
        }

        // 화면 밖 제거
        if (item.y > 650) {
          items.splice(itemIndex, 1)
        }
      })

      const now = Date.now()
      if (now - lastShotAt >= shootInterval) {
        shoot()
        lastShotAt = now
      }

      if (score >= nextBossScore) {
        spawnBoss()
        nextBossScore += 500
      }

      if (now - lastBossShotAt >= bossShootInterval) {
        enemies.forEach((enemy) => {
          if (enemy.type !== 'boss') return

          const fromX = enemy.x + enemy.width / 2
          const fromY = enemy.y + enemy.height
          const toX = player.x + player.width / 2
          const toY = player.y + player.height / 2
          const dx = toX - fromX
          const dy = toY - fromY
          const distance = Math.hypot(dx, dy) || 1
          const speed = 5

          enemyBullets.push({
            x: fromX - 6,
            y: fromY,
            width: 12,
            height: 12,
            vx: (dx / distance) * speed,
            vy: (dy / distance) * speed,
          })
        })

        lastBossShotAt = now
      }

      if (score >= 1000 && now - lastEnemyShotAt >= enemyShootInterval) {
        const normalEnemies = enemies.filter((enemy) => enemy.type !== 'boss')
        if (normalEnemies.length > 0) {
          const shooter =
            normalEnemies[Math.floor(Math.random() * normalEnemies.length)]
          const fromX = shooter.x + shooter.width / 2
          const fromY = shooter.y + shooter.height
          const toX = player.x + player.width / 2
          const toY = player.y + player.height / 2
          const dx = toX - fromX
          const dy = toY - fromY
          const distance = Math.hypot(dx, dy) || 1
          const speed = 4

          enemyBullets.push({
            x: fromX - 5,
            y: fromY,
            width: 10,
            height: 10,
            vx: (dx / distance) * speed,
            vy: (dy / distance) * speed,
          })
        }
        lastEnemyShotAt = now
      }

      // 총알 이동
      bullets.forEach((bullet, bulletIndex) => {
        if (bullet.type === 'homing') {
          let target = null
          let minDistance = Infinity

          enemies.forEach((enemy) => {
            const dx = enemy.x + enemy.width / 2 - (bullet.x + bullet.width / 2)
            const dy = enemy.y + enemy.height / 2 - (bullet.y + bullet.height / 2)
            const distance = Math.hypot(dx, dy)

            if (distance < minDistance) {
              minDistance = distance
              target = enemy
            }
          })

          if (target) {
            const dx =
              target.x + target.width / 2 - (bullet.x + bullet.width / 2)
            const dy =
              target.y + target.height / 2 - (bullet.y + bullet.height / 2)
            const distance = Math.hypot(dx, dy) || 1
            const turnRate = 0.35
            bullet.vx = bullet.vx * (1 - turnRate) + (dx / distance) * bullet.speed * turnRate
            bullet.vy = bullet.vy * (1 - turnRate) + (dy / distance) * bullet.speed * turnRate
          }

          bullet.x += bullet.vx
          bullet.y += bullet.vy
        } else {
          bullet.y -= bullet.speed
        }

        if (
          bullet.y < -30 ||
          bullet.y > 630 ||
          bullet.x < -30 ||
          bullet.x > 830
        ) {
          bullets.splice(bulletIndex, 1)
        }
      })

      enemyBullets.forEach((bullet, bulletIndex) => {
        bullet.x += bullet.vx
        bullet.y += bullet.vy

        if (
          bullet.x < -30 ||
          bullet.x > 830 ||
          bullet.y < -30 ||
          bullet.y > 630
        ) {
          enemyBullets.splice(bulletIndex, 1)
          return
        }

        if (collision(player, bullet)) {
          gameOver = true
        }
      })

      // 적 이동
      enemies.forEach((enemy, enemyIndex) => {
        enemy.y += enemy.speed

        // 플레이어 충돌
        if (collision(player, enemy)) {
          gameOver = true
        }

        // 화면 밖
        if (enemy.y > 650) {
          enemies.splice(enemyIndex, 1)
        }

        // 총알 충돌
        bullets.forEach((bullet, bulletIndex) => {
          if (collision(bullet, enemy)) {
            bullets.splice(bulletIndex, 1)

            if (enemy.type === 'boss') {
              enemy.hp -= 1

              if (enemy.hp <= 0) {
                enemies.splice(enemyIndex, 1)
                score += 200
              }
            } else {
              enemies.splice(enemyIndex, 1)
              score += 10

              // 아이템 드랍
              if (Math.random() < 0.1) {
                items.push({
                  x: enemy.x,
                  y: enemy.y,
                  width: 30,
                  height: 30,
                  type: 'power',
                })
              }
            }
          }
        })
      })
    }

    // 그리기
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 배경
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 플레이어
      ctx.fillStyle = '#00ff00'
      ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
      )

      // 총알
      bullets.forEach((bullet) => {
        ctx.fillStyle = bullet.type === 'homing' ? '#00aaff' : '#ffff00'
        ctx.fillRect(
          bullet.x,
          bullet.y,
          bullet.width,
          bullet.height
        )
      })

      ctx.fillStyle = '#ff8800'
      enemyBullets.forEach((bullet) => {
        ctx.fillRect(
          bullet.x,
          bullet.y,
          bullet.width,
          bullet.height
        )
      })

      // 적
      ctx.fillStyle = '#ff0000'

      enemies.forEach((enemy) => {
        if (enemy.type === 'boss') {
          ctx.fillStyle = '#aa00ff'
          ctx.fillRect(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
          )

          ctx.fillStyle = '#fff'
          ctx.font = '20px Arial'
          ctx.fillText(`BOSS HP: ${enemy.hp}`, enemy.x, enemy.y - 10)
          ctx.fillStyle = '#ff0000'
        } else {
          ctx.fillRect(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
          )
        }
      })

      // 점수
      ctx.fillStyle = '#fff'
      ctx.font = '30px Arial'
      ctx.fillText('Score: ' + score, 20, 40)
      ctx.font = '20px Arial'
      ctx.fillText(`Normal: ${playerPower}/5`, 20, 70)
      ctx.fillText(`Homing: ${homingPower}/5`, 20, 95)

      // 게임오버
      if (gameOver) {
        ctx.fillStyle = 'red'
        ctx.font = '70px Arial'
        ctx.fillText('GAME OVER', 180, 300)
        ctx.fillStyle = '#fff'
        ctx.font = '26px Arial'
        ctx.fillText('Press Space to Restart', 230, 350)
      }

      ctx.fillStyle = '#00ffff'

      items.forEach((item) => {
        ctx.fillRect(
          item.x,
          item.y,
          item.width,
          item.height
        )
      })
    }

    let animationId

    const gameLoop = () => {
      update()
      draw()

      animationId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)

      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)

      clearInterval(enemySpawnIntervalId)
    }
  }, [])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#111',
      }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          border: '4px solid white',
          background: '#000',
        }}
      />
    </div>
  )
}