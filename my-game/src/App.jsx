import { useEffect, useRef, useState, useCallback } from 'react'

const WIDTH = 800
const HEIGHT = 500

const PADDLE_WIDTH = 120
const PADDLE_HEIGHT = 15

const BALL_RADIUS = 10

const BRICK_ROWS = 5
const BRICK_COLS = 10

const BRICK_WIDTH = 70
const BRICK_HEIGHT = 25
const BRICK_PADDING = 5
const MAX_STAGE = 10
const ITEM_SIZE = 18
const ITEM_FALL_SPEED = 3
const ITEM_DROP_CHANCE = 0.35
const MIN_BALL_SPEED = 2
const MAX_BALL_SPEED = 12
const MIN_PADDLE_WIDTH = 60
const BASE_BALL_SPEED = 5

const getStageRows = (stage) => Math.min(BRICK_ROWS + Math.floor((stage - 1) / 2), 9)
const getStageBallSpeed = (stage) => BASE_BALL_SPEED + (stage - 1) * 0.4
const getStagePaddleWidth = (stage) => Math.max(PADDLE_WIDTH - (stage - 1) * 4, 84)

const createBall = (dx = BASE_BALL_SPEED, dy = -BASE_BALL_SPEED) => ({
  x: WIDTH / 2,
  y: HEIGHT / 2,
  dx,
  dy,
  active: true,
})

export default function App() {
  const canvasRef = useRef(null)
  /*벽돌깨기 게임*/

  const score = useRef(0)
  const [gameOver, setGameOver] = useState(false)
  const [stage, setStage] = useState(1)
  const [gameClear, setGameClear] = useState(false)
  const [isBallAttached, setIsBallAttached] = useState(true)

  const paddle = useRef({
    x: WIDTH / 2 - PADDLE_WIDTH / 2,
    y: HEIGHT - 40,
    speed: 8,
    width: PADDLE_WIDTH,
  })

  const balls = useRef([createBall()])

  const keys = useRef({
    left: false,
    right: false,
  })

  const bricks = useRef([])
  const items = useRef([])

  const generateBricks = useCallback((targetStage) => {
    const temp = []
    const rows = getStageRows(targetStage)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        temp.push({
          x: c * (BRICK_WIDTH + BRICK_PADDING) + 30,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + 40,
          visible: true,
        })
      }
    }

    bricks.current = temp
  }, [])

  const launchBall = useCallback(() => {
    if (gameOver || gameClear || !isBallAttached) return
    setIsBallAttached(false)
  }, [gameOver, gameClear, isBallAttached])

  const update = useCallback(() => {
    if (gameOver || gameClear) return

    if (keys.current.left) {
      paddle.current.x -= paddle.current.speed
    }

    if (keys.current.right) {
      paddle.current.x += paddle.current.speed
    }

    if (paddle.current.x < 0) paddle.current.x = 0

    if (paddle.current.x + paddle.current.width > WIDTH) {
      paddle.current.x = WIDTH - paddle.current.width
    }

    if (isBallAttached) {
      const mainBall = balls.current[0]
      if (mainBall) {
        mainBall.x = paddle.current.x + paddle.current.width / 2
        mainBall.y = paddle.current.y - BALL_RADIUS - 1
      }
      return
    }

    balls.current.forEach((ball) => {
      if (!ball.active) return

      ball.x += ball.dx
      ball.y += ball.dy

      if (ball.x <= BALL_RADIUS || ball.x >= WIDTH - BALL_RADIUS) {
        ball.dx *= -1
      }

      if (ball.y <= BALL_RADIUS) {
        ball.dy *= -1
      }

      if (
        ball.y + BALL_RADIUS >= paddle.current.y &&
        ball.x >= paddle.current.x &&
        ball.x <= paddle.current.x + paddle.current.width &&
        ball.dy > 0
      ) {
        ball.dy *= -1
      }

      if (ball.y - BALL_RADIUS > HEIGHT) {
        ball.active = false
      }

      bricks.current.forEach((brick) => {
        if (!brick.visible) return

        const hit =
          ball.x + BALL_RADIUS > brick.x &&
          ball.x - BALL_RADIUS < brick.x + BRICK_WIDTH &&
          ball.y + BALL_RADIUS > brick.y &&
          ball.y - BALL_RADIUS < brick.y + BRICK_HEIGHT

        if (hit) {
          brick.visible = false
          ball.dy *= -1
          score.current += 10

          if (Math.random() < ITEM_DROP_CHANCE) {
            const types = ['paddle', 'slow', 'multi', 'shrink', 'fast']
            const type = types[Math.floor(Math.random() * types.length)]

            items.current.push({
              x: brick.x + BRICK_WIDTH / 2 - ITEM_SIZE / 2,
              y: brick.y + BRICK_HEIGHT / 2 - ITEM_SIZE / 2,
              type,
              active: true,
            })
          }
        }
      })
    })

    items.current.forEach((item) => {
      if (!item.active) return

      item.y += ITEM_FALL_SPEED

      const caught =
        item.y + ITEM_SIZE >= paddle.current.y &&
        item.x + ITEM_SIZE >= paddle.current.x &&
        item.x <= paddle.current.x + paddle.current.width

      if (caught) {
        item.active = false

        if (item.type === 'paddle') {
          paddle.current.width = Math.min(paddle.current.width + 20, 220)
        } else if (item.type === 'shrink') {
          paddle.current.width = Math.max(paddle.current.width - 20, MIN_PADDLE_WIDTH)
        } else if (item.type === 'slow') {
          balls.current.forEach((ball) => {
            ball.dx = Math.sign(ball.dx) * Math.max(Math.abs(ball.dx) * 0.85, MIN_BALL_SPEED)
            ball.dy = Math.sign(ball.dy) * Math.max(Math.abs(ball.dy) * 0.85, MIN_BALL_SPEED)
          })
        } else if (item.type === 'fast') {
          balls.current.forEach((ball) => {
            ball.dx = Math.sign(ball.dx) * Math.min(Math.abs(ball.dx) * 1.15, MAX_BALL_SPEED)
            ball.dy = Math.sign(ball.dy) * Math.min(Math.abs(ball.dy) * 1.15, MAX_BALL_SPEED)
          })
        } else if (item.type === 'multi') {
          const baseBall = balls.current[0]
          if (baseBall) {
            balls.current.push({
              x: baseBall.x,
              y: baseBall.y,
              dx: -baseBall.dx,
              dy: baseBall.dy,
              active: true,
            })
          }
        }
      }

      if (item.y > HEIGHT) item.active = false
    })

    balls.current = balls.current.filter((ball) => ball.active)
    if (balls.current.length === 0) {
      setGameOver(true)
      return
    }

    items.current = items.current.filter((item) => item.active)

    if (bricks.current.every((brick) => !brick.visible)) {
      if (stage >= MAX_STAGE) {
        setGameClear(true)
        return
      }

      const nextStage = stage + 1
      const nextSpeed = getStageBallSpeed(nextStage)

      setStage(nextStage)
      setIsBallAttached(true)
      items.current = []
      paddle.current.width = getStagePaddleWidth(nextStage)
      paddle.current.x = WIDTH / 2 - paddle.current.width / 2
      balls.current = [createBall(nextSpeed, -nextSpeed)]
      generateBricks(nextStage)
    }
  }, [gameOver, gameClear, stage, generateBricks, isBallAttached])

  const draw = useCallback((ctx) => {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    ctx.fillStyle = '#22d3ee'
    ctx.fillRect(
      paddle.current.x,
      paddle.current.y,
      paddle.current.width,
      PADDLE_HEIGHT
    )

    balls.current.forEach((ball) => {
      ctx.beginPath()
      ctx.arc(
        ball.x,
        ball.y,
        BALL_RADIUS,
        0,
        Math.PI * 2
      )
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.closePath()
    })

    bricks.current.forEach((brick) => {
      if (!brick.visible) return

      ctx.fillStyle = '#f43f5e'
      ctx.fillRect(
        brick.x,
        brick.y,
        BRICK_WIDTH,
        BRICK_HEIGHT
      )
    })

    items.current.forEach((item) => {
      let color = '#f59e0b'
      if (item.type === 'paddle') color = '#22c55e'
      if (item.type === 'shrink') color = '#a855f7'
      if (item.type === 'slow') color = '#60a5fa'
      if (item.type === 'fast') color = '#ef4444'
      if (item.type === 'multi') color = '#f97316'

      ctx.fillStyle = color
      ctx.fillRect(item.x, item.y, ITEM_SIZE, ITEM_SIZE)
    })

    ctx.fillStyle = '#ffffff'
    ctx.font = '24px Arial'
    ctx.fillText('Score: ' + score.current, 20, 30)
    ctx.fillText('Stage: ' + stage + '/' + MAX_STAGE, 20, 60)
    ctx.fillText('Balls: ' + balls.current.length, 20, 90)

    if (gameClear) {
      ctx.font = '46px Arial'
      ctx.fillText('ALL STAGE CLEAR!', WIDTH / 2 - 210, HEIGHT / 2)
    } else if (gameOver) {
      ctx.font = '50px Arial'
      ctx.fillText('GAME OVER', WIDTH / 2 - 170, HEIGHT / 2)
    } else if (isBallAttached) {
      ctx.font = '26px Arial'
      ctx.fillText('Press SPACE to launch', WIDTH / 2 - 140, HEIGHT / 2 + 40)
    }
  }, [gameOver, gameClear, stage, isBallAttached])

  useEffect(() => {
    generateBricks(1)
  }, [generateBricks])

  useEffect(() => {
    const keyDown = (e) => {
      if (e.key === 'ArrowLeft') keys.current.left = true
      if (e.key === 'ArrowRight') keys.current.right = true
      if (e.key === ' ') {
        e.preventDefault()
        launchBall()
      }
    }

    const keyUp = (e) => {
      if (e.key === 'ArrowLeft') keys.current.left = false
      if (e.key === 'ArrowRight') keys.current.right = false
    }

    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)

    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
    }
  }, [launchBall])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')

    let animationId

    const gameLoop = () => {
      update()
      draw(ctx)

      animationId = requestAnimationFrame(gameLoop)
    }

    animationId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [update, draw])

  useEffect(() => {
  canvasRef.current.focus()
  }, [])

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        background: '#020617',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') keys.current.left = true
            if (e.key === 'ArrowRight') keys.current.right = true
            if (e.key === ' ') {
              e.preventDefault()
              launchBall()
            }
          }}
          onKeyUp={(e) => {
            if (e.key === 'ArrowLeft') keys.current.left = false
            if (e.key === 'ArrowRight') keys.current.right = false
          }}
          style={{
            border: '4px solid #22d3ee',
            background: '#000000',
            outline: 'none',
          }}
        />

        <button
          onClick={() => {
            setGameOver(false)
            setGameClear(false)
            setIsBallAttached(true)
            setStage(1)
            score.current = 0

            paddle.current.width = getStagePaddleWidth(1)
            paddle.current.x = WIDTH / 2 - paddle.current.width / 2

            const firstStageSpeed = getStageBallSpeed(1)
            balls.current = [createBall(firstStageSpeed, -firstStageSpeed)]

            items.current = []
            generateBricks(1)
            canvasRef.current?.focus()
          }}
          style={{
            padding: '10px 20px',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          Restart
        </button>
      </div>

      <div
        style={{
          width: '240px',
          padding: '16px',
          borderRadius: '12px',
          border: '2px solid #334155',
          background: '#0f172a',
          color: '#e2e8f0',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h3 style={{ margin: '0 0 14px 0', fontSize: '22px' }}>아이템 설명</h3>
        <p style={{ margin: '0 0 12px 0', color: '#93c5fd' }}>스테이지 10까지 점점 더 어려워집니다.</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: ITEM_SIZE, height: ITEM_SIZE, background: '#22c55e' }} />
          <span>초록: 패들 길이 증가</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: ITEM_SIZE, height: ITEM_SIZE, background: '#60a5fa' }} />
          <span>파랑: 공 속도 감소</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: ITEM_SIZE, height: ITEM_SIZE, background: '#f97316' }} />
          <span>주황: 공 1개 추가</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: ITEM_SIZE, height: ITEM_SIZE, background: '#a855f7' }} />
          <span>보라: 패들 길이 감소</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: ITEM_SIZE, height: ITEM_SIZE, background: '#ef4444' }} />
          <span>빨강: 공 속도 증가</span>
        </div>
      </div>
    </div>
  )
}