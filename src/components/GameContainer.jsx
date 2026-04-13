import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { PLAYER_STATS, GAME_COLORS, COMBAT_STATS, GAME_STATS } from '../constants/game'
import Player from '../game_objects/Player'

const GameContainer = ({game_width, game_height, setScore}) => {
  const gameRef = useRef(null)

  console.log(game_width, game_height)

  const scaleX = game_width / GAME_STATS.BASE_WIDTH
  const scaleY = game_height / GAME_STATS.BASE_HEIGHT

  console.log(scaleX, scaleY)

  useEffect(() => {
    if (!game_width || !game_height) return

    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-container',
      width: game_width,
      height: game_height,
      physics: {
        default: 'arcade',
        arcade: { 
            gravity: { y: GAME_STATS.GRAVITY * scaleY },
            debug: false // Change en true pour voir les hitboxes
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    let p1, p2
    let platforms

    function preload() {
      this.load.image("bg", "assets/game_bg.png")
      this.load.spritesheet("biker", "assets/biker.png", {
        frameWidth: 48,
        frameHeight: 48
      })
    }

    function create() {
      // 0. Affichage du background
      this.add.image(0, 0, "bg")
        .setOrigin(0,0)
        .setDisplaySize(game_width, game_height)

      // 1. Création du sol (Plateforme centrale)
      platforms = this.physics.add.staticGroup()
      const downPlat = this.add.rectangle(0.5*game_width, 0.92*game_height, 0.46*game_width, 0.07*game_height, GAME_COLORS.GROUND)
      const topPlat = this.add.rectangle(0.5*game_width, 0.6*game_height, 0.26*game_width, 0.07*game_height, GAME_COLORS.GROUND)
      const leftPlat = this.add.rectangle(0.215*game_width, 0.74*game_height, 0.14*game_width, 0.05*game_height, GAME_COLORS.GROUND)
      const rightPlat = this.add.rectangle(0.785*game_width, 0.74*game_height, 0.14*game_width, 0.05*game_height, GAME_COLORS.GROUND)
      platforms.add(downPlat); platforms.add(topPlat); platforms.add(leftPlat); platforms.add(rightPlat);

      // 2. Création des animations
      this.anims.create({ key: 'idle',     frames: this.anims.generateFrameNumbers('biker', { start: 0,  end: 3  }), frameRate: 8,  repeat: -1 })
      this.anims.create({ key: 'jump',     frames: this.anims.generateFrameNumbers('biker', { start: 6,  end: 9  }), frameRate: 12, repeat: 0  })
      this.anims.create({ key: 'run',      frames: this.anims.generateFrameNumbers('biker', { start: 12, end: 17 }), frameRate: 16, repeat: -1 })
      this.anims.create({ key: 'dash',     frames: this.anims.generateFrameNumbers('biker', { start: 18, end: 23 }), frameRate: 8,  repeat: 0  })
      this.anims.create({ key: 'gradient', frames: this.anims.generateFrameNumbers('biker', { start: 24, end: 29 }), frameRate: 8,  repeat: 0  })
      this.anims.create({ key: 'hurt',     frames: this.anims.generateFrameNumbers('biker', { start: 30, end: 31 }), frameRate: 20, repeat: -1 })

      // 2. Création des joueurs
      const wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      })
      const arrows = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
        jump: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO,
      })
      p1 = new Player(this, 0.5*game_width - 0.1*game_width, 0.45*game_height, 0.02*game_width, 0.1*game_height, GAME_COLORS.PLAYER_ONE, wasd, scaleX, scaleY)
      p2 = new Player(this, 0.5*game_width + 0.1*game_width, 0.45*game_height, 0.02*game_width, 0.1*game_height, GAME_COLORS.PLAYER_TWO, arrows, scaleX, scaleY)
      this.input.on('pointerdown', (pointer) => handleAttack(this, p1))

      // 3. Collisions
      this.physics.add.collider(p1.hurtbox, platforms)
      this.physics.add.collider(p2.hurtbox, platforms)
      this.physics.add.collider(p1.hurtbox, p2.hurtbox) // Les joueurs se rentrent dedans
    }

    function update() {
      // Mouvement P1
      if (p1.canAct()) {
        if (p1.keys.left.isDown) {
          p1.setVelocity({ x: -(400 * scaleX) })
        } else if (p1.keys.right.isDown) {
          p1.setVelocity({ x: (400 * scaleX) })
        }
        if (p1.keys.jump.isDown && p1.hurtbox.body.touching.down) p1.setVelocity({ y: -(900 * scaleY) })
      }
    
      // Mouvement P2
      if (p2.canAct()) {
        if (p2.keys.left.isDown) {
          p2.setVelocity({ x: -(400 * scaleX) })
        } else if (p2.keys.right.isDown) {
          p2.setVelocity({ x: (400 * scaleX) })
        }
        if (p2.keys.jump.isDown && p2.hurtbox.body.touching.down) p2.setVelocity({ y: -(900 * scaleY) })
      }

      // Player Direction
      if (!p1.isAttacking) p1.setDirection(this.input.activePointer)
      if (!p2.isAttacking) p2.setDirection(this.input.activePointer)
      
      // Air attack Counter
      if (p1.hurtbox.body.touching.down) p1.hasAttacked = false
      if (p2.hurtbox.body.touching.down) p2.hasAttacked = false

      // Hitbox follows the Player
      if (p1.hitbox !== null) {
          p1.hitbox.setPosition(
              p1.hurtbox.x + p1.direction.x * 0.02*game_width,
              p1.hurtbox.y + p1.direction.y * 0.05*game_height
          )
      }
      if (p2.hitbox !== null) {
          p2.hitbox.setPosition(
              p2.hurtbox.x + p2.direction.x * 0.02*game_width,
              p2.hurtbox.y + p2.direction.y * 0.05*game_height
          )
      }

      // Sprites update
      p1.updateSprite()
      p2.updateSprite()

      // Détection de collision manuelle des attaques
      if (p1.attackStatus == "ACTIVE" && p2.attackStatus != "HITLAG"
        && Phaser.Geom.Intersects.RectangleToRectangle(p1.hitbox.getBounds(), p2.hurtbox.getBounds())
      ) {
        p1.hasAttacked = false
        applyKnockback(this, p2, p1)
      }
      if (p2.attackStatus == "ACTIVE" && p1.attackStatus != "HITLAG"
        && Phaser.Geom.Intersects.RectangleToRectangle(p2.hitbox.getBounds(), p1.hurtbox.getBounds())
      ) {
        p2.hasAttacked = false
        applyKnockback(this, p1, p2)
      }

      // Reset si tombe
      if (isDead(p1) || isDead(p2)) {
        if (isDead(p1)) setScore(sc => [sc[0], sc[1] + 1])
        if (isDead(p2)) setScore(sc => [sc[0] + 1, sc[1]])
        p1.hurtbox.setPosition(0.5*game_width - 0.1*game_width, 0.45*game_height)
        p1.resetStats()
        p2.hurtbox.setPosition(0.5*game_width + 0.1*game_width, 0.45*game_height)
        p2.resetStats()
      }
    }

    function isDead(player) {
      if (player.hurtbox.y > game_height*1.3) return true
      else if (player.hurtbox.y < 0 && player.isInHitstun) return true
      else if (player.hurtbox.x < -game_width*0.2) return true
      else if (player.hurtbox.x > game_width*1.2) return true
      else return false
    }

    function endlag(scene, attacker, previousStatus) {
      if(attacker.attackStatus == previousStatus) {
        // ENDLAG
        if(attacker.hitbox != null) attacker.hitbox.destroy()
        attacker.attackStatus = "ENDLAG"
        attacker.hurtbox.body.setDragX(700 * scaleX)
        attacker.hurtbox.body.setMaxVelocity(400 * scaleX, 900 * scaleY)

        var endlag_time = PLAYER_STATS.ATTACK_ENDLAG
        if (previousStatus == "HITLAG") endlag_time = endlag_time/2
        scene.time.delayedCall(endlag_time, () => {
          // NONE
          attacker.isAttacking = false
          attacker.hurtbox.body.setDragX(1200 * scaleX)
          attacker.attackStatus = "NONE"
        })
      }
    }

    function handleAttack(scene, attacker) {
      if (attacker.isAttacking || attacker.hasAttacked) return
      // STARTUP
      attacker.isAttacking = true
      attacker.attackStatus = "STARTUP"

      const attackDir = {
        x: attacker.direction.x,
        y: attacker.direction.y
      }

      scene.time.delayedCall(PLAYER_STATS.ATTACK_STARTUP, () => {
        attacker.hasAttacked = true
        // ACTIVE
        if (!attacker.isInHitstun) {  // Est-ce que je me suis fais toucher pendant le startup ?
          attacker.attackStatus = "ACTIVE"
          attacker.hitbox = scene.add.rectangle(
            attacker.hurtbox.x + (attackDir.x * 0.02*game_width),
            attacker.hurtbox.y + (attackDir.y * 0.05*game_height),
            Math.max(0.04*game_width, 0.1*game_height),
            Math.max(0.04*game_width, 0.1*game_height),
            GAME_COLORS.HITBOX
          )
          attacker.hitbox.setAlpha(0.5)

          // moins en moins de momentum vers vertical si plusieurs attaques sans toucher sol
          attacker.hurtbox.body.setDragX(5000 * scaleX)
          attacker.hurtbox.body.setMaxVelocity(2000 * scaleX, 1200 * scaleY)
          attacker.setVelocity({
            x: attackDir.x*(1400 * scaleX),
            y: attackDir.y*(1400 * scaleY)
          })

          scene.time.delayedCall(PLAYER_STATS.ATTACK_DURATION, () => endlag(scene, attacker, "ACTIVE"))
        }
      })
    }

    function applyKnockback(scene, target, attacker) {
      // HITLAG
      const dirX = attacker.direction.x
      const dirY = attacker.direction.y
      target.isInHitstun = true
      if (target.attackStatus != "ACTIVE") {
        target.isAttacking = false
        target.attackStatus = "NONE"
      }
      attacker.attackStatus = "HITLAG"
      attacker.setVelocity({ x: 0, y: 0 })
      target.setVelocity({ x: 0, y: 0 })
      scene.physics.world.gravity.y = 0
      const currentTime = scene.time.now

      if (currentTime - target.lastHitTime < COMBAT_STATS.COMBO_WINDOW) {
        target.currentCombo = Math.min(target.currentCombo + 1, COMBAT_STATS.MAX_COMBO)
      } else {
        target.currentCombo = 1
      }

      scene.time.delayedCall(PLAYER_STATS.ATTACK_HITLAG, () => {
        scene.physics.world.gravity.y = GAME_STATS.GRAVITY * scaleY
        endlag(scene, attacker, "HITLAG")
        target.lastHitTime = currentTime
        const base_kb = 600 * ((scaleX + scaleY) / 2)
        const force = base_kb + (target.currentCombo * base_kb * 0.3)

        target.hurtbox.body.setDragX(800 * scaleX)
        target.hurtbox.body.setMaxVelocity(2000 * scaleX, 1200 * scaleY)
        
        target.setVelocity({ x: dirX * force * scaleX })
        target.setVelocity({ y: dirY * force * scaleY * 0.5 })

        scene.time.delayedCall(PLAYER_STATS.ATTACK_KB_DURATION, () => {
          target.isInHitstun = false
          target.hurtbox.body.setDragX(1200 * scaleX)
          target.hurtbox.body.setMaxVelocity(400 * scaleX, 900 * scaleY)
        })
      })
    }

    return () => game.destroy(true)
  }, [game_width, game_height])

  return <div id="phaser-container" style={{ borderRadius: '8px', overflow: 'hidden' }} />
}

export default GameContainer