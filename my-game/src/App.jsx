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

export default function App() {
  const canvasRef = useRef(null)
  /*벽돌깨기 게임*/

  const score = useRef(0)
  const [gameOver, setGameOver] = useState(false)

  const paddle = useRef({
    x: WIDTH / 2 - PADDLE_WIDTH / 2,
    y: HEIGHT - 40,
    speed: 8,
  })

  const ball = useRef({
    x: WIDTH / 2,
    y: HEIGHT / 2,
    dx: 5,
    dy: -5,
  })

  const keys = useRef({
    left: false,
    right: false,
  })

  const bricks = useRef([])

  const update = useCallback(() => {
    if (gameOver) return

    if (keys.current.left) {
      paddle.current.x -= paddle.current.speed
    }

    if (keys.current.right) {
      paddle.current.x += paddle.current.speed
    }

    if (paddle.current.x < 0) paddle.current.x = 0

    if (paddle.current.x + PADDLE_WIDTH > WIDTH) {
      paddle.current.x = WIDTH - PADDLE_WIDTH
    }

    ball.current.x += ball.current.dx
    ball.current.y += ball.current.dy

    if (ball.current.x <= BALL_RADIUS || ball.current.x >= WIDTH - BALL_RADIUS) {
      ball.current.dx *= -1
    }

    if (ball.current.y <= BALL_RADIUS) {
      ball.current.dy *= -1
    }

    if (
      ball.current.y + BALL_RADIUS >= paddle.current.y &&
      ball.current.x >= paddle.current.x &&
      ball.current.x <= paddle.current.x + PADDLE_WIDTH
    ) {
      ball.current.dy *= -1
    }

    if (ball.current.y > HEIGHT) {
      setGameOver(true)
    }

    bricks.current.forEach((brick) => {
      if (!brick.visible) return

      const hit =
        ball.current.x + BALL_RADIUS > brick.x &&
        ball.current.x - BALL_RADIUS < brick.x + BRICK_WIDTH &&
        ball.current.y + BALL_RADIUS > brick.y &&
        ball.current.y - BALL_RADIUS < brick.y + BRICK_HEIGHT

      if (hit) {
        brick.visible = false
        ball.current.dy *= -1
        score.current += 10
      }
    })
  }, [gameOver])

  const draw = useCallback((ctx) => {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    ctx.fillStyle = '#22d3ee'
    ctx.fillRect(
      paddle.current.x,
      paddle.current.y,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    )

    ctx.beginPath()
    ctx.arc(
      ball.current.x,
      ball.current.y,
      BALL_RADIUS,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.closePath()

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

    ctx.fillStyle = '#ffffff'
    ctx.font = '24px Arial'
    ctx.fillText('Score: ' + score.current, 20, 30)

    if (gameOver) {
      ctx.font = '50px Arial'
      ctx.fillText('GAME OVER', WIDTH / 2 - 170, HEIGHT / 2)
    }
  }, [gameOver])

  useEffect(() => {
    const temp = []

    for (let r = 0; r < BRICK_ROWS; r++) {
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

  useEffect(() => {
    const keyDown = (e) => {
      if (e.key === 'ArrowLeft') keys.current.left = true
      if (e.key === 'ArrowRight') keys.current.right = true
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
  }, [])

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
        background: '#020617',
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
          score.current = 0

          paddle.current.x = WIDTH / 2 - PADDLE_WIDTH / 2

          ball.current = {
            x: WIDTH / 2,
            y: HEIGHT / 2,
            dx: 5,
            dy: -5,
          }

          bricks.current.forEach((brick) => {
            brick.visible = true
          })
        }}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '20px',
          cursor: 'pointer',
        }}
      >
        Restart
      </button>
    </div>
  )
}