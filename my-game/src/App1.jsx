import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const GROUND_TOP = 450
const PLAYER_W = 40
const PLAYER_H_SMALL = 40
const PLAYER_H_BIG = 56
const BRICK_SIZE = 40
const FIRE_COOLDOWN_FRAMES = 14
/** 보스가 이 거리 안에 플레이어가 있을 때만 총알 쿨다운·발사 */
const BOSS_SHOOT_NEAR_X = 420
const BOSS_SHOOT_NEAR_Y = 260

const STAGES = [
  {
    name: '1',
    worldWidth: 5000,
    skyColor: '#87CEEB',
    groundSegments: [
      { x: 0, y: GROUND_TOP, width: 1400, height: 50 },
      { x: 1580, y: GROUND_TOP, width: 820, height: 50 },
      { x: 2480, y: GROUND_TOP, width: 620, height: 50 },
      { x: 3200, y: GROUND_TOP, width: 680, height: 50 },
      { x: 4000, y: GROUND_TOP, width: 1000, height: 50 },
    ],
    castleX: 4680,
    platforms: [
      { x: 250, y: 350, width: 150, height: 20 },
      { x: 500, y: 280, width: 150, height: 20 },
      { x: 750, y: 200, width: 150, height: 20 },
      { x: 1100, y: 380, width: 200, height: 20 },
      { x: 1450, y: 300, width: 200, height: 20 },
      { x: 1800, y: 240, width: 200, height: 20 },
      { x: 2200, y: 350, width: 200, height: 20 },
      { x: 2600, y: 280, width: 200, height: 20 },
      { x: 3100, y: 220, width: 200, height: 20 },
      { x: 3500, y: 340, width: 200, height: 20 },
      { x: 4000, y: 260, width: 250, height: 20 },
    ],
    bricks: [
      { x: 380, y: 300, width: BRICK_SIZE, height: BRICK_SIZE, loot: 'mushroom' },
      { x: 1330, y: 308, width: BRICK_SIZE, height: BRICK_SIZE, loot: 'flower' },
    ],
    coins: [
      { x: 300, y: 310 },
      { x: 550, y: 240 },
      { x: 800, y: 160 },
      { x: 200, y: 400 },
      { x: 900, y: 400 },
      { x: 1050, y: 400 },
      { x: 1200, y: 365 },
      { x: 1300, y: 285 },
      { x: 1550, y: 285 },
      { x: 1650, y: 400 },
      { x: 2000, y: 225 },
      { x: 2150, y: 400 },
      { x: 2300, y: 335 },
      { x: 2500, y: 335 },
      { x: 2750, y: 265 },
      { x: 2950, y: 400 },
      { x: 3200, y: 205 },
      { x: 3300, y: 400 },
      { x: 3550, y: 325 },
      { x: 3700, y: 400 },
      { x: 4050, y: 400 },
      { x: 4100, y: 245 },
      { x: 4400, y: 400 },
      { x: 4750, y: 400 },
    ],
    enemies: [
      { x: 400, y: 410, width: 40, height: 40, dir: 1, speed: 2 },
      { x: 700, y: 410, width: 40, height: 40, dir: -1, speed: 2 },
      { x: 950, y: 410, width: 40, height: 40, dir: 1, speed: 2 },
      { x: 1200, y: 410, width: 40, height: 40, dir: 1, speed: 3 },
      { x: 1500, y: 410, width: 40, height: 40, dir: -1, speed: 2 },
      { x: 1350, y: 410, width: 40, height: 40, dir: -1, speed: 3 },
      { x: 1900, y: 410, width: 40, height: 40, dir: 1, speed: 4 },
      { x: 2050, y: 410, width: 40, height: 40, dir: 1, speed: 3 },
      { x: 2210, y: 410, width: 40, height: 40, dir: -1, speed: 3 },
      { x: 2500, y: 410, width: 40, height: 40, dir: -1, speed: 3 },
      { x: 2700, y: 410, width: 40, height: 40, dir: 1, speed: 5 },
      { x: 3200, y: 410, width: 40, height: 40, dir: -1, speed: 3 },
      { x: 3400, y: 410, width: 40, height: 40, dir: 1, speed: 4 },
      { x: 3600, y: 410, width: 40, height: 40, dir: -1, speed: 4 },
      { x: 3800, y: 410, width: 40, height: 40, dir: 1, speed: 4 },
      { x: 4150, y: 410, width: 40, height: 40, dir: 1, speed: 3 },
      { x: 4300, y: 410, width: 40, height: 40, dir: -1, speed: 5 },
      { x: 4600, y: 410, width: 40, height: 40, dir: 1, speed: 4 },
      { x: 1180, y: 340, width: 40, height: 40, dir: 1, speed: 2 },
      { x: 1880, y: 200, width: 40, height: 40, dir: -1, speed: 2 },
      { x: 3180, y: 180, width: 40, height: 40, dir: 1, speed: 3 },
    ],
  },
  {
    name: '2',
    worldWidth: 3000,
    skyColor: '#7eb8da',
    groundSegments: [
      { x: 0, y: GROUND_TOP, width: 880, height: 50 },
      { x: 1020, y: GROUND_TOP, width: 680, height: 50 },
      { x: 1850, y: GROUND_TOP, width: 1150, height: 50 },
    ],
    castleX: 2780,
    platforms: [
      { x: 760, y: 355, width: 200, height: 20 },
      { x: 1500, y: 345, width: 200, height: 20 },
      { x: 1180, y: 295, width: 130, height: 20 },
      { x: 2050, y: 270, width: 180, height: 20 },
      { x: 2280, y: 210, width: 150, height: 20 },
      { x: 2480, y: 320, width: 120, height: 20 },
    ],
    bricks: [
      { x: 840, y: 292, width: BRICK_SIZE, height: BRICK_SIZE, loot: 'mushroom' },
      { x: 2140, y: 188, width: BRICK_SIZE, height: BRICK_SIZE, loot: 'flower' },
    ],
    coins: [
      { x: 180, y: 400 },
      { x: 450, y: 400 },
      { x: 820, y: 330 },
      { x: 1080, y: 400 },
      { x: 1280, y: 265 },
      { x: 1580, y: 400 },
      { x: 1920, y: 400 },
      { x: 2140, y: 240 },
      { x: 2560, y: 400 },
      { x: 2720, y: 400 },
    ],
    enemies: [
      { x: 320, y: 410, width: 40, height: 40, dir: 1, speed: 2 },
      { x: 600, y: 410, width: 40, height: 40, dir: -1, speed: 3 },
      { x: 1280, y: 410, width: 40, height: 40, dir: 1, speed: 3 },
      { x: 1520, y: 410, width: 40, height: 40, dir: -1, speed: 2 },
      { x: 2080, y: 410, width: 40, height: 40, dir: 1, speed: 4 },
      { x: 2320, y: 170, width: 40, height: 40, dir: -1, speed: 2 },
    ],
  },
  {
    name: '3',
    worldWidth: 3400,
    skyColor: '#c4a574',
    groundSegments: [
      { x: 0, y: GROUND_TOP, width: 700, height: 50 },
      { x: 880, y: GROUND_TOP, width: 550, height: 50 },
      { x: 1620, y: GROUND_TOP, width: 600, height: 50 },
      { x: 2420, y: GROUND_TOP, width: 980, height: 50 },
    ],
    castleX: 3180,
    platforms: [
      { x: 620, y: 358, width: 180, height: 20 },
      { x: 1320, y: 348, width: 160, height: 20 },
      { x: 2080, y: 342, width: 170, height: 20 },
      { x: 1040, y: 285, width: 110, height: 20 },
      { x: 1780, y: 255, width: 95, height: 20 },
      { x: 2580, y: 305, width: 100, height: 20 },
      { x: 2880, y: 250, width: 90, height: 20 },
    ],
    bricks: [
      { x: 700, y: 290, width: BRICK_SIZE, height: BRICK_SIZE, loot: 'mushroom' },
      { x: 2620, y: 228, width: BRICK_SIZE, height: BRICK_SIZE, loot: 'flower' },
    ],
    coins: [
      { x: 150, y: 400 },
      { x: 420, y: 400 },
      { x: 780, y: 330 },
      { x: 1120, y: 400 },
      { x: 1180, y: 265 },
      { x: 1500, y: 400 },
      { x: 1820, y: 400 },
      { x: 1810, y: 225 },
      { x: 2200, y: 400 },
      { x: 2680, y: 400 },
      { x: 2920, y: 235 },
      { x: 3280, y: 400 },
    ],
    enemies: [
      { x: 280, y: 410, width: 40, height: 40, dir: 1, speed: 3 },
      { x: 520, y: 410, width: 40, height: 40, dir: -1, speed: 4 },
      { x: 980, y: 410, width: 40, height: 40, dir: 1, speed: 4 },
      { x: 1280, y: 410, width: 40, height: 40, dir: -1, speed: 3 },
      { x: 1750, y: 410, width: 40, height: 40, dir: 1, speed: 5 },
      { x: 1980, y: 410, width: 40, height: 40, dir: -1, speed: 4 },
      { x: 2280, y: 410, width: 40, height: 40, dir: 1, speed: 5 },
      { x: 2680, y: 410, width: 40, height: 40, dir: -1, speed: 4 },
      { x: 3000, y: 410, width: 40, height: 40, dir: 1, speed: 5 },
      { x: 1060, y: 245, width: 40, height: 40, dir: 1, speed: 3 },
      { x: 1800, y: 215, width: 40, height: 40, dir: -1, speed: 4 },
    ],
  },
  {
    name: '4',
    worldWidth: 4000,
    skyColor: '#6a7a8c',
    groundSegments: [
      { x: 0, y: GROUND_TOP, width: 580, height: 50 },
      { x: 820, y: GROUND_TOP, width: 430, height: 50 },
      { x: 1480, y: GROUND_TOP, width: 500, height: 50 },
      { x: 2220, y: GROUND_TOP, width: 1780, height: 50 },
    ],
    castleX: 3750,
    platforms: [
      { x: 520, y: 352, width: 140, height: 20 },
      { x: 1120, y: 338, width: 120, height: 20 },
      { x: 1320, y: 300, width: 85, height: 20 },
      { x: 2060, y: 335, width: 130, height: 20 },
      { x: 980, y: 270, width: 75, height: 20 },
      { x: 1680, y: 245, width: 80, height: 20 },
      { x: 1880, y: 290, width: 70, height: 20 },
      { x: 2580, y: 315, width: 95, height: 20 },
      { x: 2880, y: 260, width: 75, height: 20 },
      { x: 3180, y: 220, width: 70, height: 20 },
    ],
    bricks: [
      { x: 580, y: 312, width: BRICK_SIZE, height: BRICK_SIZE, loot: 'mushroom' },
      { x: 1710, y: 205, width: BRICK_SIZE, height: BRICK_SIZE, loot: 'flower' },
    ],
    coins: [
      { x: 120, y: 400 },
      { x: 350, y: 400 },
      { x: 680, y: 320 },
      { x: 1000, y: 400 },
      { x: 1020, y: 235 },
      { x: 1350, y: 400 },
      { x: 1620, y: 400 },
      { x: 1720, y: 210 },
      { x: 2000, y: 400 },
      { x: 2480, y: 400 },
      { x: 2780, y: 275 },
      { x: 3220, y: 400 },
      { x: 3580, y: 400 },
    ],
    enemies: [
      { x: 220, y: 410, width: 40, height: 40, dir: 1, speed: 4 },
      { x: 420, y: 410, width: 40, height: 40, dir: -1, speed: 5 },
      { x: 920, y: 410, width: 40, height: 40, dir: 1, speed: 5 },
      { x: 1180, y: 410, width: 40, height: 40, dir: -1, speed: 4 },
      { x: 1620, y: 410, width: 40, height: 40, dir: 1, speed: 6 },
      { x: 1880, y: 410, width: 40, height: 40, dir: -1, speed: 5 },
      { x: 2380, y: 410, width: 40, height: 40, dir: 1, speed: 6 },
      { x: 2680, y: 410, width: 40, height: 40, dir: -1, speed: 5 },
      { x: 3080, y: 410, width: 40, height: 40, dir: 1, speed: 6 },
      { x: 3480, y: 410, width: 40, height: 40, dir: -1, speed: 5 },
      { x: 1000, y: 230, width: 40, height: 40, dir: 1, speed: 4 },
      { x: 1700, y: 205, width: 40, height: 40, dir: -1, speed: 5 },
      { x: 2900, y: 220, width: 40, height: 40, dir: 1, speed: 5 },
    ],
  },
  {
    name: '5',
    worldWidth: 4500,
    skyColor: '#2d1f3d',
    groundSegments: [
      { x: 0, y: GROUND_TOP, width: 450, height: 50 },
      { x: 700, y: GROUND_TOP, width: 350, height: 50 },
      { x: 1310, y: GROUND_TOP, width: 470, height: 50 },
      { x: 2080, y: GROUND_TOP, width: 440, height: 50 },
      { x: 2820, y: GROUND_TOP, width: 1680, height: 50 },
    ],
    castleX: 4250,
    platforms: [
      { x: 380, y: 348, width: 120, height: 20 },
      { x: 560, y: 318, width: 95, height: 20 },
      { x: 1180, y: 340, width: 100, height: 20 },
      { x: 1000, y: 285, width: 70, height: 20 },
      { x: 1220, y: 250, width: 65, height: 20 },
      { x: 1720, y: 328, width: 110, height: 20 },
      { x: 1980, y: 295, width: 75, height: 20 },
      { x: 1920, y: 255, width: 60, height: 20 },
      { x: 2480, y: 332, width: 100, height: 20 },
      { x: 2380, y: 280, width: 65, height: 20 },
      { x: 2580, y: 235, width: 60, height: 20 },
      { x: 3180, y: 300, width: 80, height: 20 },
      { x: 3380, y: 255, width: 65, height: 20 },
      { x: 3580, y: 210, width: 60, height: 20 },
    ],
    bricks: [
      { x: 580, y: 278, width: BRICK_SIZE, height: BRICK_SIZE, loot: 'mushroom' },
      { x: 3220, y: 260, width: BRICK_SIZE, height: BRICK_SIZE, loot: 'flower' },
    ],
    coins: [
      { x: 100, y: 400 },
      { x: 320, y: 400 },
      { x: 520, y: 310 },
      { x: 820, y: 400 },
      { x: 1020, y: 400 },
      { x: 1240, y: 235 },
      { x: 1500, y: 400 },
      { x: 1780, y: 400 },
      { x: 1900, y: 250 },
      { x: 2240, y: 400 },
      { x: 2600, y: 400 },
      { x: 2500, y: 245 },
      { x: 3000, y: 400 },
      { x: 3400, y: 400 },
      { x: 3600, y: 200 },
      { x: 4100, y: 400 },
      { x: 4320, y: 400 },
    ],
    enemies: [
      { x: 180, y: 410, width: 40, height: 40, dir: 1, speed: 5 },
      { x: 380, y: 410, width: 40, height: 40, dir: -1, speed: 6 },
      { x: 780, y: 410, width: 40, height: 40, dir: 1, speed: 6 },
      { x: 980, y: 410, width: 40, height: 40, dir: -1, speed: 5 },
      { x: 1420, y: 410, width: 40, height: 40, dir: 1, speed: 7 },
      { x: 1650, y: 410, width: 40, height: 40, dir: -1, speed: 6 },
      { x: 2180, y: 410, width: 40, height: 40, dir: 1, speed: 7 },
      { x: 2380, y: 410, width: 40, height: 40, dir: -1, speed: 6 },
      { x: 3000, y: 410, width: 40, height: 40, dir: 1, speed: 7 },
      { x: 3300, y: 410, width: 40, height: 40, dir: -1, speed: 6 },
      { x: 3650, y: 410, width: 40, height: 40, dir: 1, speed: 7 },
      { x: 1010, y: 245, width: 40, height: 40, dir: 1, speed: 5 },
      { x: 1230, y: 210, width: 40, height: 40, dir: -1, speed: 6 },
      { x: 1930, y: 215, width: 40, height: 40, dir: 1, speed: 6 },
      { x: 2390, y: 240, width: 40, height: 40, dir: -1, speed: 5 },
      { x: 2590, y: 195, width: 40, height: 40, dir: 1, speed: 6 },
    ],
    boss: {
      x: 3920,
      y: GROUND_TOP - 100,
      width: 100,
      height: 100,
      maxHp: 10,
      speed: 1.5,
      patrol: 160,
    },
  },
]

export default function App1() {
  const canvasRef = useRef(null)
  const gameShellRef = useRef(null)
  /*마리오 스타일 게임*/

  const keys = useRef({})

  const isEmbedded =
    typeof window !== 'undefined' && window.self !== window.top
  const gameInputActiveRef = useRef(!isEmbedded)
  const [showTapOverlay, setShowTapOverlay] = useState(isEmbedded)

  const activateGameInput = () => {
    gameInputActiveRef.current = true
    setShowTapOverlay(false)
    gameShellRef.current?.focus({ preventScroll: true })
    canvasRef.current?.focus({ preventScroll: true })
  }

  useLayoutEffect(() => {
    const shell = gameShellRef.current
    const cv = canvasRef.current
    shell?.focus({ preventScroll: true })
    cv?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const marioImg = new Image()
    let marioReady = false
    marioImg.onload = () => {
      marioReady = true
    }
    marioImg.src = `${import.meta.env.BASE_URL}Mariojump.png`

    const goombaImg = new Image()
    let goombaReady = false
    goombaImg.onload = () => {
      goombaReady = true
    }
    goombaImg.src = `${import.meta.env.BASE_URL}goomba.png`

    const koopaImg = new Image()
    let koopaReady = false
    koopaImg.onload = () => {
      koopaReady = true
    }
    koopaImg.src = `${import.meta.env.BASE_URL}koopa.png`

    const focusGameShell = () => {
      gameShellRef.current?.focus({ preventScroll: true })
      canvasRef.current?.focus({ preventScroll: true })
    }
    focusGameShell()
    const focusRaf = requestAnimationFrame(() => {
      requestAnimationFrame(focusGameShell)
    })

    const gravity = 0.5

    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'

    const player = {
      x: 100,
      y: 300,
      width: PLAYER_W,
      height: PLAYER_H_SMALL,
      dx: 0,
      dy: 0,
      speed: 5,
      jumpPower: -12,
      grounded: false,
      power: 'small',
      facing: 1,
      hitInvuln: 0,
    }

    let cameraX = 0
    let worldWidth = STAGES[0].worldWidth
    let groundSegments = []
    let platforms = []
    let bricks = []
    let items = []
    let fireballs = []
    let fireCooldown = 0
    let coins = []
    let enemies = []
    let boss = null
    let bossShots = []
    let castleX = STAGES[0].castleX
    let castleDoor = { x: 0, y: 0, width: 56, height: 72 }
    let skyColor = STAGES[0].skyColor

    let stageIndex = 0
    let score = 0
    let gameOver = false
    let gameClear = false
    let allStagesComplete = false

    const applyPlayerSize = () => {
      const feet = player.y + player.height
      if (player.power === 'small') {
        player.height = PLAYER_H_SMALL
      } else {
        player.height = PLAYER_H_BIG
      }
      player.width = PLAYER_W
      player.y = feet - player.height
    }

    const loadStage = (index) => {
      const s = STAGES[index]
      worldWidth = s.worldWidth
      skyColor = s.skyColor
      groundSegments = s.groundSegments.map((g) => ({ ...g }))
      platforms = s.platforms.map((p) => ({ ...p }))
      bricks = (s.bricks || []).map((b) => ({
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        loot: b.loot ?? 'mushroom',
        broken: false,
      }))
      items = []
      fireballs = []
      fireCooldown = 0
      coins = s.coins.map((c) => ({ x: c.x, y: c.y, collected: false }))
      enemies = s.enemies.map((e) => ({
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
        dir: e.dir,
        speed: e.speed,
        dead: false,
        falling: false,
        dy: 0,
        startX: e.x,
      }))
      bossShots = []
      if (s.boss) {
        const B = s.boss
        boss = {
          x: B.x,
          y: B.y,
          width: B.width,
          height: B.height,
          maxHp: B.maxHp ?? 10,
          hp: B.maxHp ?? 10,
          dead: false,
          dir: B.dir ?? 1,
          speed: B.speed ?? 1.5,
          startX: B.x,
          patrol: B.patrol ?? 160,
          fireCd: 100,
          stompInvuln: 0,
        }
      } else {
        boss = null
      }
      castleX = s.castleX
      castleDoor = {
        x: castleX + 92,
        y: GROUND_TOP - 72,
        width: 56,
        height: 72,
      }
      player.x = 100
      player.y = 300
      player.dx = 0
      player.dy = 0
      player.grounded = false
      player.power = 'small'
      player.facing = 1
      player.hitInvuln = 0
      applyPlayerSize()
      cameraX = 0
      gameClear = false
      gameOver = false
    }

    loadStage(0)

    const isTypingTarget = (target) => {
      if (!target || typeof target !== 'object') return false
      if (!('tagName' in target) || !target.tagName) return false
      const tag = target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
      return Boolean(target.isContentEditable)
    }

    const clearHeldKeys = () => {
      keys.current = {}
    }

    const goNextAfterClear = () => {
      if (allStagesComplete) {
        stageIndex = 0
        allStagesComplete = false
        score = 0
        loadStage(0)
      } else {
        stageIndex += 1
        loadStage(stageIndex)
      }
      clearHeldKeys()
    }

    const keyDown = (e) => {
      const path = typeof e.composedPath === 'function' ? e.composedPath() : []
      const typing =
        isTypingTarget(e.target) ||
        path.some((node) => node && isTypingTarget(node))
      if (typing) return

      if (gameClear && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault()
        goNextAfterClear()
        return
      }

      if (gameOver && e.code === 'Space') {
        e.preventDefault()
        loadStage(stageIndex)
        clearHeldKeys()
        return
      }

      if (
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight' ||
        e.code === 'ArrowUp' ||
        e.code === 'Space' ||
        e.code === 'KeyZ'
      ) {
        e.preventDefault()
      }

      keys.current[e.code] = true
    }

    const keyUp = (e) => {
      keys.current[e.code] = false
    }

    document.addEventListener('keydown', keyDown, true)
    document.addEventListener('keyup', keyUp, true)
    window.addEventListener('blur', clearHeldKeys)

    const collision = (a, b) => {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      )
    }

    const update = () => {
      if (!gameInputActiveRef.current) return

      if (player.hitInvuln > 0) player.hitInvuln -= 1

      player.dx = 0

      if (keys.current['ArrowLeft']) {
        player.dx = -player.speed
        player.facing = -1
      }

      if (keys.current['ArrowRight']) {
        player.dx = player.speed
        player.facing = 1
      }

      player.x += player.dx

      if (
        (keys.current['Space'] || keys.current['ArrowUp']) &&
        player.grounded
      ) {
        player.dy = player.jumpPower
        player.grounded = false
      }

      player.dy += gravity
      const topBefore = player.y
      const bottomBefore = topBefore + player.height
      player.y += player.dy

      player.grounded = false

      const breakBrick = (b) => {
        if (b.broken) return
        b.broken = true
        const loot = b.loot ?? 'mushroom'
        if (loot === 'empty') return
        const cx = b.x + b.width / 2
        if (loot === 'mushroom') {
          items.push({
            type: 'mushroom',
            x: cx - 14,
            y: b.y - 8,
            width: 28,
            height: 28,
            vx: 2.2,
            dy: 0,
            phase: 'rise',
            rise: 0,
            collected: false,
          })
        } else if (loot === 'flower') {
          items.push({
            type: 'flower',
            x: cx - 16,
            y: b.y - 32,
            width: 32,
            height: 32,
            collected: false,
            bob: 0,
          })
        }
      }

      groundSegments.forEach((segment) => {
        if (collision(player, segment) && player.dy >= 0) {
          player.y = segment.y - player.height
          player.dy = 0
          player.grounded = true
        }
      })

      if (player.y > canvas.height + 40) {
        gameOver = true
      }

      platforms.forEach((platform) => {
        if (collision(player, platform) && player.dy >= 0) {
          player.y = platform.y - player.height
          player.dy = 0
          player.grounded = true
        }
      })

      bricks.forEach((b) => {
        if (b.broken) return
        if (!collision(player, b)) return
        /* 아래에서 박음: (1) 밑면 근처로 올라와 입술에 닿음 (2) 발판에 붙여 세로로 겹친 벽돌 — 옆면 슬라이드 오탐 방지 */
        {
          const brickBot = b.y + b.height
          const lipHit =
            topBefore >= brickBot - 28 &&
            topBefore < brickBot + 6 &&
            bottomBefore > brickBot - 16
          const flushUnder =
            topBefore <= b.y + 4 &&
            bottomBefore >= brickBot - 8 &&
            bottomBefore <= brickBot + 10
          if (
            player.dy < 0 &&
            bottomBefore > brickBot - 16 &&
            topBefore < brickBot + 6 &&
            player.y < brickBot + 18 &&
            (lipHit || flushUnder)
          ) {
            player.y = brickBot
            player.dy = 0
            breakBrick(b)
            return
          }
        }
        if (
          player.dy >= 0 &&
          topBefore + player.height <= b.y + 16 &&
          player.y + player.height > b.y
        ) {
          player.y = b.y - player.height
          player.dy = 0
          player.grounded = true
        }
      })

      if (player.power === 'fire' && keys.current['KeyZ']) {
        if (fireCooldown <= 0) {
          fireballs.push({
            x: player.facing > 0 ? player.x + player.width - 4 : player.x - 10,
            y: player.y + player.height / 2 - 5,
            width: 12,
            height: 12,
            vx: player.facing * 10,
            dead: false,
          })
          fireCooldown = FIRE_COOLDOWN_FRAMES
        }
      }
      if (fireCooldown > 0) fireCooldown -= 1

      fireballs.forEach((fb) => {
        if (fb.dead) return
        fb.x += fb.vx
        if (fb.x < -40 || fb.x > worldWidth + 40) {
          fb.dead = true
          return
        }
        bricks.forEach((b) => {
          if (b.broken || fb.dead) return
          if (collision(fb, b)) {
            b.broken = true
            fb.dead = true
          }
        })
        if (fb.dead) return
        groundSegments.forEach((seg) => {
          if (collision(fb, seg)) fb.dead = true
        })
        platforms.forEach((p) => {
          if (collision(fb, p)) fb.dead = true
        })
        if (fb.dead) return
        if (boss && !boss.dead && collision(fb, boss)) {
          boss.hp -= 1
          fb.dead = true
          score += 40
          if (boss.hp <= 0) {
            boss.dead = true
            score += 1500
          }
        }
        if (fb.dead) return
        enemies.forEach((enemy) => {
          if (enemy.dead || fb.dead) return
          if (collision(fb, enemy)) {
            enemy.dead = true
            fb.dead = true
            score += 50
          }
        })
      })
      fireballs = fireballs.filter((fb) => !fb.dead)

      const landItemOnSolid = (it) => {
        it.grounded = false
        groundSegments.forEach((segment) => {
          if (collision(it, segment) && it.dy >= 0) {
            it.y = segment.y - it.height
            it.dy = 0
            it.grounded = true
          }
        })
        platforms.forEach((platform) => {
          if (collision(it, platform) && it.dy >= 0) {
            it.y = platform.y - it.height
            it.dy = 0
            it.grounded = true
          }
        })
        bricks.forEach((b) => {
          if (b.broken) return
          if (collision(it, b) && it.dy >= 0) {
            it.y = b.y - it.height
            it.dy = 0
            it.grounded = true
          }
        })
      }

      items.forEach((it) => {
        if (it.collected) return
        if (it.type === 'flower') {
          it.bob = (it.bob || 0) + 0.12
          return
        }
        if (it.type === 'mushroom') {
          if (it.phase === 'rise') {
            it.rise = (it.rise || 0) + 1
            it.y -= 2.5
            if (it.rise >= 14) {
              it.phase = 'walk'
              it.dy = 0
            }
            return
          }
          it.dy = (it.dy || 0) + gravity
          it.y += it.dy
          landItemOnSolid(it)
          const prevMx = it.x
          it.x += it.vx
          let wall = false
          bricks.forEach((b) => {
            if (b.broken) return
            if (collision(it, b)) wall = true
          })
          platforms.forEach((p) => {
            if (collision(it, p)) wall = true
          })
          if (wall) {
            it.x = prevMx
            it.vx *= -1
          }
        }
      })

      items.forEach((it) => {
        if (it.collected) return
        if (!collision(player, it)) return
        if (it.type === 'mushroom') {
          if (player.power === 'small') {
            player.power = 'big'
            applyPlayerSize()
            score += 1000
          } else {
            score += 500
          }
        } else if (it.type === 'flower') {
          if (player.power === 'small') {
            score += 200
          } else if (player.power === 'big') {
            player.power = 'fire'
            applyPlayerSize()
            score += 500
          } else {
            score += 300
          }
        }
        it.collected = true
      })
      items = items.filter((it) => !it.collected)

      coins.forEach((coin) => {
        if (coin.collected) return

        const hit =
          player.x < coin.x + 20 &&
          player.x + player.width > coin.x &&
          player.y < coin.y + 20 &&
          player.y + player.height > coin.y

        if (hit) {
          coin.collected = true
          score += 10
        }
      })

      enemies.forEach((enemy) => {
        if (enemy.dead) return

        if (enemy.falling) {
          enemy.dy = (enemy.dy || 0) + gravity
          enemy.y += enemy.dy
          if (enemy.y > canvas.height + 80) enemy.dead = true
          return
        }

        enemy.x += enemy.speed * enemy.dir

        if (
          enemy.x <= enemy.startX - 100 ||
          enemy.x >= enemy.startX + 100
        ) {
          enemy.dir *= -1
        }

        const footMid = enemy.x + enemy.width / 2
        const footBottom = enemy.y + enemy.height
        if (footBottom >= GROUND_TOP - 2 && footBottom <= GROUND_TOP + 6) {
          let supported = false
          for (const seg of groundSegments) {
            if (footMid >= seg.x && footMid <= seg.x + seg.width) {
              supported = true
              break
            }
          }
          if (!supported) {
            enemy.falling = true
            enemy.dy = 0
          }
        }

        const hit = collision(player, enemy)

        if (hit) {
          if (
            player.dy > 0 &&
            player.y + player.height - enemy.y < 20
          ) {
            enemy.dead = true
            player.dy = -8
            score += 50
          } else if (player.hitInvuln > 0) {
            /* 무적 중 옆 충돌 무시 */
          } else if (collision(player, castleDoor)) {
            /* 성 문 안 */
          } else if (player.power === 'fire') {
            player.power = 'big'
            applyPlayerSize()
            player.hitInvuln = 100
            player.dy = -5
          } else if (player.power === 'big') {
            player.power = 'small'
            applyPlayerSize()
            player.hitInvuln = 100
            player.dy = -5
          } else {
            gameOver = true
          }
        }
      })

      if (boss && !boss.dead) {
        if (boss.stompInvuln > 0) boss.stompInvuln -= 1
        boss.x += boss.speed * boss.dir
        if (
          boss.x <= boss.startX - boss.patrol ||
          boss.x >= boss.startX + boss.patrol
        ) {
          boss.dir *= -1
        }
        const playerCx = player.x + player.width / 2
        const playerCy = player.y + player.height / 2
        const bossCx = boss.x + boss.width / 2
        const bossCy = boss.y + boss.height / 2
        const nearBossForShoot =
          Math.abs(playerCx - bossCx) < BOSS_SHOOT_NEAR_X &&
          Math.abs(playerCy - bossCy) < BOSS_SHOOT_NEAR_Y
        if (nearBossForShoot) {
          boss.fireCd -= 1
          if (boss.fireCd <= 0) {
            const toward = playerCx < bossCx ? -1 : 1
            bossShots.push({
              x: boss.x + boss.width / 2 - 8,
              y: boss.y + boss.height * 0.35,
              width: 18,
              height: 14,
              vx: toward * 5.5,
              dead: false,
            })
            boss.fireCd = 130
          }
        }
        const hitBoss = collision(player, boss)
        if (hitBoss) {
          const stomp =
            player.dy > 0 &&
            player.y + player.height - boss.y < boss.height * 0.35
          if (stomp) {
            player.dy = -7
            if (boss.stompInvuln <= 0) {
              boss.hp -= 1
              boss.stompInvuln = 20
              score += 40
              if (boss.hp <= 0) {
                boss.dead = true
                score += 1500
              }
            }
          } else if (player.hitInvuln > 0) {
            /* 무적 */
          } else if (collision(player, castleDoor)) {
            /* */
          } else if (player.power === 'fire') {
            player.power = 'big'
            applyPlayerSize()
            player.hitInvuln = 100
            player.dy = -5
          } else if (player.power === 'big') {
            player.power = 'small'
            applyPlayerSize()
            player.hitInvuln = 100
            player.dy = -5
          } else {
            gameOver = true
          }
        }
      }

      bossShots.forEach((bs) => {
        if (bs.dead) return
        bs.x += bs.vx
        if (bs.x < -30 || bs.x > worldWidth + 30) {
          bs.dead = true
          return
        }
        if (collision(bs, player)) {
          bs.dead = true
          if (player.hitInvuln > 0) return
          if (player.power === 'fire') {
            player.power = 'big'
            applyPlayerSize()
            player.hitInvuln = 100
            player.dy = -4
          } else if (player.power === 'big') {
            player.power = 'small'
            applyPlayerSize()
            player.hitInvuln = 100
            player.dy = -4
          } else {
            gameOver = true
          }
          return
        }
        groundSegments.forEach((seg) => {
          if (collision(bs, seg)) bs.dead = true
        })
        platforms.forEach((p) => {
          if (collision(bs, p)) bs.dead = true
        })
        bricks.forEach((b) => {
          if (!b.broken && collision(bs, b)) bs.dead = true
        })
      })
      bossShots = bossShots.filter((bs) => !bs.dead)

      if (!gameOver && collision(player, castleDoor)) {
        const lastStage = stageIndex >= STAGES.length - 1
        if (lastStage && boss && !boss.dead) {
          /* 보스 격파 후 성 입장 */
        } else {
          gameClear = true
          if (lastStage) {
            allStagesComplete = true
          }
        }
      }

      cameraX = player.x - 300

      if (cameraX < 0) {
        cameraX = 0
      }

      const maxCam = worldWidth - canvas.width
      if (cameraX > maxCam) {
        cameraX = maxCam
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = skyColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#228B22'
      groundSegments.forEach((segment) => {
        ctx.fillRect(
          segment.x - cameraX,
          segment.y,
          segment.width,
          segment.height
        )
      })

      ctx.fillStyle = '#8B4513'
      platforms.forEach((platform) => {
        ctx.fillRect(
          platform.x - cameraX,
          platform.y,
          platform.width,
          platform.height
        )
      })

      bricks.forEach((b) => {
        if (b.broken) return
        const bx = b.x - cameraX
        const loot = b.loot ?? 'mushroom'
        const cx = bx + b.width / 2
        const cy = b.y + b.height / 2

        if (loot === 'empty') {
          ctx.fillStyle = '#a0522d'
          ctx.fillRect(bx, b.y, b.width, b.height)
          ctx.strokeStyle = '#4a2c12'
          ctx.lineWidth = 2
          ctx.strokeRect(bx, b.y, b.width, b.height)
          ctx.fillStyle = 'rgba(0,0,0,0.15)'
          ctx.fillRect(bx + 4, b.y + 6, b.width - 8, 6)
          return
        }

        if (loot === 'flower') {
          ctx.fillStyle = '#d4a017'
          ctx.fillRect(bx, b.y, b.width, b.height)
          ctx.strokeStyle = '#8b6914'
          ctx.lineWidth = 3
          ctx.strokeRect(bx, b.y, b.width, b.height)
          ctx.fillStyle = 'rgba(255,255,255,0.25)'
          ctx.fillRect(bx + 2, b.y + 2, b.width - 4, 8)
          const pet = ['#e63946', '#ffd60a', '#4361ee', '#e63946']
          for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 - Math.PI / 2
            ctx.fillStyle = pet[i]
            ctx.beginPath()
            ctx.ellipse(
              cx + Math.cos(a) * 9,
              cy + Math.sin(a) * 7,
              5,
              4,
              a,
              0,
              Math.PI * 2
            )
            ctx.fill()
          }
          ctx.fillStyle = '#1d3557'
          ctx.beginPath()
          ctx.arc(cx, cy + 2, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(0,0,0,0.12)'
          ctx.fillRect(bx + 4, b.y + 24, b.width - 8, 5)
          return
        }

        ctx.fillStyle = '#c45c26'
        ctx.fillRect(bx, b.y, b.width, b.height)
        ctx.strokeStyle = '#9b1c3a'
        ctx.lineWidth = 3
        ctx.strokeRect(bx, b.y, b.width, b.height)
        ctx.fillStyle = 'rgba(0,0,0,0.1)'
        ctx.fillRect(bx + 4, b.y + 6, b.width - 8, 6)
        ctx.fillStyle = '#d62828'
        ctx.beginPath()
        ctx.arc(cx, b.y + 18, 10, Math.PI, 0, true)
        ctx.fill()
        ctx.fillStyle = '#f5f5dc'
        ctx.fillRect(cx - 5, b.y + 14, 10, 8)
        ctx.fillStyle = '#fff'
        ctx.fillRect(bx + 10, b.y + 8, 4, 3)
        ctx.fillRect(bx + 22, b.y + 9, 3, 3)
      })

      const cx = castleX - cameraX
      const ch = 165
      const cy = GROUND_TOP - ch
      ctx.fillStyle = '#7a7a8c'
      ctx.fillRect(cx + 35, cy + 40, 130, ch - 40)
      ctx.fillRect(cx, cy + 85, 45, ch - 85)
      ctx.fillRect(cx + 155, cy + 85, 45, ch - 85)
      ctx.fillStyle = '#c41e3a'
      ctx.beginPath()
      ctx.moveTo(cx + 30, cy + 40)
      ctx.lineTo(cx + 100, cy)
      ctx.lineTo(cx + 170, cy + 40)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx - 5, cy + 85)
      ctx.lineTo(cx + 22, cy + 55)
      ctx.lineTo(cx + 50, cy + 85)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx + 150, cy + 85)
      ctx.lineTo(cx + 177, cy + 55)
      ctx.lineTo(cx + 205, cy + 85)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#2a1810'
      ctx.fillRect(cx + 92, GROUND_TOP - 72, 56, 72)

      const px = player.x - cameraX
      const py = player.y
      const pw = player.width
      const ph = player.height
      if (
        marioReady &&
        marioImg.complete &&
        marioImg.naturalWidth > 0
      ) {
        ctx.save()
        if (player.facing < 0) {
          ctx.translate(px + pw, py)
          ctx.scale(-1, 1)
          ctx.drawImage(marioImg, 0, 0, pw, ph)
        } else {
          ctx.drawImage(marioImg, px, py, pw, ph)
        }
        if (player.power === 'fire') {
          ctx.globalCompositeOperation = 'source-atop'
          ctx.fillStyle = 'rgba(255, 120, 40, 0.35)'
          ctx.fillRect(0, 0, pw, ph)
          ctx.globalCompositeOperation = 'source-over'
        }
        ctx.restore()
      } else {
        ctx.fillStyle =
          player.power === 'fire'
            ? '#ff6b35'
            : player.power === 'big'
              ? '#e63946'
              : '#ff0000'
        ctx.fillRect(px, py, pw, ph)
      }

      enemies.forEach((enemy) => {
        if (enemy.dead) return
        const ex = enemy.x - cameraX
        const ey = enemy.y
        const ew = enemy.width
        const eh = enemy.height
        if (
          goombaReady &&
          goombaImg.complete &&
          goombaImg.naturalWidth > 0
        ) {
          ctx.save()
          if (enemy.dir < 0) {
            ctx.translate(ex + ew, ey)
            ctx.scale(-1, 1)
            ctx.drawImage(goombaImg, 0, 0, ew, eh)
          } else {
            ctx.drawImage(goombaImg, ex, ey, ew, eh)
          }
          ctx.restore()
        } else {
          ctx.fillStyle = 'purple'
          ctx.fillRect(ex, ey, ew, eh)
        }
      })

      if (boss && !boss.dead) {
        const bx = boss.x - cameraX
        const by = boss.y
        const bw = boss.width
        const bh = boss.height
        if (
          koopaReady &&
          koopaImg.complete &&
          koopaImg.naturalWidth > 0
        ) {
          ctx.save()
          if (boss.dir < 0) {
            ctx.translate(bx + bw, by)
            ctx.scale(-1, 1)
            ctx.drawImage(koopaImg, 0, 0, bw, bh)
          } else {
            ctx.drawImage(koopaImg, bx, by, bw, bh)
          }
          ctx.restore()
        } else {
          ctx.fillStyle = '#2d6a4f'
          ctx.fillRect(bx, by, bw, bh)
        }
        const barW = bw + 16
        const barX = bx - 8
        const barY = by - 14
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(barX, barY, barW, 8)
        ctx.fillStyle = '#e63946'
        ctx.fillRect(
          barX + 2,
          barY + 2,
          ((barW - 4) * boss.hp) / boss.maxHp,
          4
        )
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.strokeRect(barX, barY, barW, 8)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 11px Arial'
        ctx.fillText(`BOSS ${boss.hp}/${boss.maxHp}`, barX + barW / 2 - 28, barY - 3)
      }

      const bossShotShowDist = 300
      bossShots.forEach((bs) => {
        if (bs.dead) return
        const bcx = bs.x + bs.width / 2
        const bcy = bs.y + bs.height / 2
        const pcx = player.x + player.width / 2
        const pcy = player.y + player.height / 2
        const dist = Math.hypot(bcx - pcx, bcy - pcy)
        if (dist > bossShotShowDist) return
        const sx = bs.x - cameraX
        ctx.beginPath()
        ctx.ellipse(sx + 9, bs.y + 7, 10, 7, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#2ecc71'
        ctx.fill()
        ctx.strokeStyle = '#145a32'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(sx + 9, bs.y + 7, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#f1c40f'
        ctx.fill()
      })

      coins.forEach((coin) => {
        if (coin.collected) return
        ctx.beginPath()
        ctx.arc(coin.x - cameraX, coin.y, 10, 0, Math.PI * 2)
        ctx.fillStyle = 'gold'
        ctx.fill()
      })

      items.forEach((it) => {
        if (it.collected) return
        if (it.type === 'mushroom') {
          const mx = it.x - cameraX
          const my = it.y
          ctx.fillStyle = '#f5f5dc'
          ctx.fillRect(mx + 8, my + 14, 12, 14)
          ctx.fillStyle = '#d62828'
          ctx.beginPath()
          ctx.ellipse(mx + 14, my + 12, 12, 9, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.fillRect(mx + 10, my + 8, 4, 4)
          ctx.fillRect(mx + 16, my + 9, 3, 3)
        } else if (it.type === 'flower') {
          const fx = it.x - cameraX
          const fy = it.y + Math.sin(it.bob || 0) * 4
          ctx.fillStyle = '#2d6a4f'
          ctx.fillRect(fx + 12, fy + 16, 8, 16)
          const petals = ['#e63946', '#ffd60a', '#4361ee', '#ffd60a', '#e63946', '#4361ee']
          for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2 + (it.bob || 0)
            ctx.fillStyle = petals[i]
            ctx.beginPath()
            ctx.ellipse(
              fx + 16 + Math.cos(ang) * 10,
              fy + 14 + Math.sin(ang) * 10,
              7,
              5,
              ang,
              0,
              Math.PI * 2
            )
            ctx.fill()
          }
          ctx.fillStyle = '#333'
          ctx.beginPath()
          ctx.arc(fx + 16, fy + 14, 5, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      fireballs.forEach((fb) => {
        if (fb.dead) return
        const fbx = fb.x - cameraX
        ctx.beginPath()
        ctx.arc(fbx + 6, fb.y + 6, 8, 0, Math.PI * 2)
        ctx.fillStyle = '#ffb703'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(fbx + 6, fb.y + 6, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#fff3b0'
        ctx.fill()
      })

      const powerLabel =
        player.power === 'fire'
          ? '불'
          : player.power === 'big'
            ? '큼'
            : '작음'
      const hudText = `STAGE ${stageIndex + 1} / ${STAGES.length}  |  ${powerLabel}  |  Score: ${score}${player.power === 'fire' ? '  |  Z 불꽃' : ''}`
      ctx.font = '26px Arial'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = 'rgba(0,0,0,0.55)'
      ctx.lineWidth = 5
      ctx.strokeText(hudText, 20, 36)
      ctx.fillStyle = '#fff'
      ctx.fillText(hudText, 20, 36)

      const brickHint1 = '벽돌: 빨간 테·버섯 그림 = 버섯  |  금색·꽃무늬 = 꽃  |  갈색 = 빈벽돌(아이템 없음)'
      ctx.font = '12px Arial'
      ctx.lineWidth = 3
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'
      ctx.strokeText(brickHint1, 20, 56)
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.fillText(brickHint1, 20, 56)

      if (gameOver) {
        ctx.fillStyle = 'red'
        ctx.font = '60px Arial'
        ctx.fillText('GAME OVER', 300, 230)
        ctx.font = '22px Arial'
        ctx.fillStyle = '#fff'
        ctx.fillText('Space — 재시작 (현재 스테이지)', 260, 290)
      }

      if (gameClear) {
        ctx.fillStyle = 'rgba(0, 40, 0, 0.82)'
        ctx.fillRect(0, 160, canvas.width, 200)
        ctx.fillStyle = '#ffd700'
        ctx.font = 'bold 44px Arial'
        if (allStagesComplete) {
          ctx.fillText('전체 스테이지 클리어!', 200, 240)
          ctx.font = '24px Arial'
          ctx.fillStyle = '#fff'
          ctx.fillText('Enter / Space — 처음부터', 300, 300)
        } else {
          ctx.fillText(`스테이지 ${stageIndex + 1} 클리어!`, 240, 240)
          ctx.font = '24px Arial'
          ctx.fillStyle = '#fff'
          ctx.fillText('Enter / Space — 다음 스테이지', 280, 300)
        }
      }
    }

    let animationId

    const gameLoop = () => {
      if (!gameOver && !gameClear) {
        update()
      }

      draw()

      animationId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
      cancelAnimationFrame(focusRaf)
      document.removeEventListener('keydown', keyDown, true)
      document.removeEventListener('keyup', keyUp, true)
      window.removeEventListener('blur', clearHeldKeys)
    }
  }, [])

  return (
    <div
      ref={gameShellRef}
      tabIndex={0}
      autoFocus
      role="application"
      aria-label="플랫폼 게임"
      onMouseDown={(ev) => ev.currentTarget.focus({ preventScroll: true })}
      onPointerDown={(ev) => ev.currentTarget.focus({ preventScroll: true })}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#222',
        outline: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        width={1000}
        height={500}
        tabIndex={0}
        style={{
          border: '4px solid white',
          background: '#87CEEB',
          outline: 'none',
        }}
      />

      {showTapOverlay && (
        <div
          role="button"
          tabIndex={0}
          aria-label="게임 시작 — 화면을 눌러 키보드 입력 활성화"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            cursor: 'pointer',
          }}
          onPointerDown={(e) => {
            e.preventDefault()
            activateGameInput()
          }}
          onKeyDown={(e) => {
            if (e.code === 'Enter' || e.code === 'Space') {
              e.preventDefault()
              activateGameInput()
            }
          }}
        >
          <p
            style={{
              color: '#fff',
              fontSize: 20,
              textAlign: 'center',
              padding: 28,
              maxWidth: 460,
              lineHeight: 1.5,
              pointerEvents: 'none',
            }}
          >
            내장 미리보기·iframe에서는 브라우저 보안상,
            <br />
            게임 영역을 한 번 눌러야 키보드 입력이 들어옵니다.
            <br />
            <span style={{ fontSize: 15, opacity: 0.88 }}>
              클릭 또는 탭하여 시작
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
