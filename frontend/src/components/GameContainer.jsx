import { memo, useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { PLAYER_STATS, GAME_COLORS, COMBAT_STATS, GAME_STATS } from '../constants/game'
import Player from '../game_objects/Player'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import ReadyPanel from './ReadyPanel'

const GameContainer = memo(({game_width, game_height, setScore, socketRef, matchId, myPlayer, active}) => {
  const gameRef = useRef(null)
  const activeRef = useRef(false)

  const scaleX = game_width / GAME_STATS.BASE_WIDTH
  const scaleY = game_height / GAME_STATS.BASE_HEIGHT

  useEffect(() => { activeRef.current = active }, [active])

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

    let me, oppo
    let p1, p2
    let platforms

    let myKeys = null

    function preload() {
      this.load.image("bg", "/assets/game_bg.png")
      this.load.spritesheet("biker", "/assets/biker.png", {
        frameWidth: 48,
        frameHeight: 48
      })
    }

    function create() {
      // 0. Affichage du background
      this.add.image(0, 0, "bg")
        .setOrigin(0,0)
        .setDisplaySize(game_width, game_height)

      // 1. Création des plateformes
      platforms = this.physics.add.staticGroup()
      const downPlat = this.add.rectangle(0.5*game_width, 0.92*game_height, 0.46*game_width, 0.07*game_height, GAME_COLORS.GROUND)
      const topPlat = this.add.rectangle(0.5*game_width, 0.6*game_height, 0.26*game_width, 0.07*game_height, GAME_COLORS.GROUND)
      const leftPlat = this.add.rectangle(0.215*game_width, 0.74*game_height, 0.14*game_width, 0.05*game_height, GAME_COLORS.GROUND)
      const rightPlat = this.add.rectangle(0.785*game_width, 0.74*game_height, 0.14*game_width, 0.05*game_height, GAME_COLORS.GROUND)
      platforms.add(downPlat); platforms.add(topPlat); platforms.add(leftPlat); platforms.add(rightPlat);
      platforms.refresh()

      // 2. Création des animations
      this.anims.create({ key: 'idle',     frames: this.anims.generateFrameNumbers('biker', { start: 0,  end: 3  }), frameRate: 8,  repeat: -1 })
      this.anims.create({ key: 'jump',     frames: this.anims.generateFrameNumbers('biker', { start: 6,  end: 9  }), frameRate: 12, repeat: 0  })
      this.anims.create({ key: 'run',      frames: this.anims.generateFrameNumbers('biker', { start: 12, end: 17 }), frameRate: 16, repeat: -1 })
      this.anims.create({ key: 'dash',     frames: this.anims.generateFrameNumbers('biker', { start: 18, end: 23 }), frameRate: 8,  repeat: 0  })
      this.anims.create({ key: 'gradient', frames: this.anims.generateFrameNumbers('biker', { start: 24, end: 29 }), frameRate: 8,  repeat: 0  })
      this.anims.create({ key: 'hurt',     frames: this.anims.generateFrameNumbers('biker', { start: 30, end: 31 }), frameRate: 20, repeat: -1 })

      // 2. Création des joueurs
      myKeys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      })
      p1 = new Player(this, 0.5*game_width - 0.1*game_width, 0.45*game_height, 0.02*game_width, 0.1*game_height, GAME_COLORS.PLAYER_ONE, scaleX, scaleY)
      p2 = new Player(this, 0.5*game_width + 0.1*game_width, 0.45*game_height, 0.02*game_width, 0.1*game_height, GAME_COLORS.PLAYER_TWO, scaleX, scaleY)
      me = myPlayer === 1 ? p1 : p2
      oppo = myPlayer === 1 ? p2 : p1
      this.input.on('pointerdown', (pointer) => handleAttack(this, me))

      // 3. Collisions
      this.physics.add.collider(p1.hurtbox, platforms)
      this.physics.add.collider(p2.hurtbox, platforms)
      this.physics.add.collider(p1.hurtbox, p2.hurtbox) // Les joueurs se rentrent dedans

      // 4. Listeners pour le multijoueur
      socketRef.current.on('opponentState', (state) => {
        oppo.hurtbox.setPosition(state.x * game_width, state.y * game_height)
        oppo.setVelocity({ x: state.vx * game_width, y: state.vy * game_height })
        if (state.hitboxActive) {
          oppo.attackStatus = state.attackStatus
          if (oppo.attackStatus === "NONE") oppo.isAttacking = false
          else oppo.isAttacking = true
          if (oppo.hitbox == null) {
            oppo.hitbox = this.add.rectangle(
              state.hitboxX * game_width, state.hitboxY * game_height,
              Math.max(0.04*game_width, 0.1*game_height),
              Math.max(0.04*game_width, 0.1*game_height),
              GAME_COLORS.HITBOX
            )
            oppo.hitbox.setAlpha(0.5)
          } else oppo.hitbox.setPosition(state.hitboxX * game_width, state.hitboxY * game_height)
        } else if (oppo.hitbox != null) {
          oppo.hitbox.destroy()
          oppo.hitbox = null
        }
        oppo.direction = state.direction
        oppo.setAnim(state.anim)
      })

      socketRef.current.on('hitReceived', (hitData) => applyKnockbackTarget(this, me, hitData))

      socketRef.current.on('playerDied', () => {
        console.log('testmdr')
        if (myPlayer === 1) setScore(sc => [sc[0] + 1, sc[1]])
        if (myPlayer === 2) setScore(sc => [sc[0], sc[1] + 1])
      })
    }

    function update() {
      if (!activeRef.current) return
      // Mouvement Joueur
      if (me.canAct()) {
        if (myKeys.left.isDown) {
          me.setVelocity({ x: -(400 * scaleX) })
        } else if (myKeys.right.isDown) {
          me.setVelocity({ x: (400 * scaleX) })
        }
        if (myKeys.jump.isDown && me.hurtbox.body.touching.down) me.setVelocity({ y: -(900 * scaleY) })
      }

      // Player Direction
      if (!me.isAttacking) me.setDirection(this.input.activePointer)
      
      // Air attack Counter
      if (me.hurtbox.body.touching.down) me.hasAttacked = false

      // Hitbox follows the Player
      if (me.hitbox !== null) {
          me.hitbox.setPosition(
              me.hurtbox.x + me.direction.x * 0.02*game_width,
              me.hurtbox.y + me.direction.y * 0.05*game_height
          )
      }

      // Sprites update
      me.updateSprite()
      oppo.updateSprite(false)

      // Détection de collision manuelle des attaques
      if (me.attackStatus == "ACTIVE" && oppo.attackStatus != "HITLAG"
        && Phaser.Geom.Intersects.RectangleToRectangle(me.hitbox.getBounds(), oppo.hurtbox.getBounds())
      ) {
        me.hasAttacked = false
        applyKnockbackAttacker(this, me)
        socketRef.current.emit('playerHit', {
          matchId,
          direction: me.direction
        })
      }

      // Reset si tombe
      if (isDead(me)) {
        if (myPlayer === 1) setScore(sc => [sc[0], sc[1] + 1])
        if (myPlayer === 2) setScore(sc => [sc[0] + 1, sc[1]])
        const offset = (2*myPlayer-3) * 0.1*game_width
        me.hurtbox.setPosition(0.5*game_width + offset, 0.45*game_height)
        me.resetStats()
        socketRef.current.emit('playerDied', { matchId: matchId })
      }

      // emit my state to server
      socketRef.current.emit('playerState', { matchId: matchId, state: {
        x: me.hurtbox.x / game_width,
        y: me.hurtbox.y / game_height,
        vx: me.hurtbox.body.velocity.x / game_width,
        vy: me.hurtbox.body.velocity.y / game_height,
        attackStatus: me.attackStatus,
        hitboxX: me.hitbox ? me.hitbox.x : null,
        hitboxY: me.hitbox ? me.hitbox.y : null,
        hitboxActive: me.hitbox ? true : false,
        direction: me.direction,
        anim: me.anim
      }})
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

    // Attacker side: hitlag freeze only
    function applyKnockbackAttacker(scene, attacker) {
      attacker.attackStatus = "HITLAG"
      attacker.setVelocity({ x: 0, y: 0 })
      attacker.hurtbox.body.setAllowGravity(false)

      scene.time.delayedCall(PLAYER_STATS.ATTACK_HITLAG, () => {
        attacker.hurtbox.body.setAllowGravity(true)
        endlag(scene, attacker, "HITLAG")
      })
    }

    // Target side: called via socket event
    function applyKnockbackTarget(scene, target, hitData) {
      const { dirX, dirY } = hitData

      target.isInHitstun = true
      target.setVelocity({ x: 0, y: 0 })
      target.hurtbox.body.setAllowGravity(false)

      const currentTime = scene.time.now
      if (currentTime - target.lastHitTime < COMBAT_STATS.COMBO_WINDOW) {
        target.currentCombo = Math.min(target.currentCombo + 1, COMBAT_STATS.MAX_COMBO)
      } else {
        target.currentCombo = 1
      }

      scene.time.delayedCall(PLAYER_STATS.ATTACK_HITLAG, () => {
        target.hurtbox.body.setAllowGravity(true)
        target.lastHitTime = currentTime

        const base_kb = PLAYER_STATS.BASE_KNOCKBACK
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
})

export default GameContainer