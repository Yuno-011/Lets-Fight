export default class Player {
    constructor(scene, x, y, w, h, color, keys, scaleX, scaleY) {
        this.hurtbox = scene.add.rectangle(x, y, w, h, color)
        scene.physics.add.existing(this.hurtbox)
        this.hurtbox.setAlpha(0)
        this.hurtbox.body.setCollideWorldBounds(false)
        this.hurtbox.body.setDragX(1200 * scaleX)
        this.hurtbox.body.setMaxVelocity(400 * scaleX, 900 * scaleY)

        this.sprite = scene.add.sprite(x, y-15*scaleY, 'biker')
        this.sprite.setDisplaySize(w * 3.5, h * 1.5)
        this.sprite.setDepth(10)
        this.sprite.play('idle')

        this.scaleX = scaleX
        this.scaleY = scaleY
        this.currentCombo = 0
        this.lastHitTime = 0
        this.keys = keys
        this.direction = { x: 0, y: 0 }
        this.hitbox = null
        this.isAttacking = false
        this.isInHitstun = false
        this.attackStatus = "NONE"
        this.hasAttacked = false
        this.scene = scene
        this.trailTimer = null
    }

    updateSprite() {
        // Follow the hurtbox
        this.sprite.setPosition(this.hurtbox.x, this.hurtbox.y-15*this.scaleY)

        // Flip based on horizontal direction
        if (this.hurtbox.body.velocity.x == 0) {
            if (this.direction.x < 0) this.sprite.setFlipX(true)
            else if (this.direction.x > 0) this.sprite.setFlipX(false)
        } else {
            if (this.hurtbox.body.velocity.x < 0) this.sprite.setFlipX(true)
            else if (this.hurtbox.body.velocity.x > 0) this.sprite.setFlipX(false)
        }

        // Animate based on state
        if (this.isInHitstun) {
            this.stopTrail()
            this.sprite.play('hurt', true)
        } else if (this.isAttacking) {
            this.startTrail()
            this.sprite.play('dash', true)
        } else if (!this.hurtbox.body.touching.down) {
            this.stopTrail()
            this.sprite.play('jump', true)
        } else if (this.keys.left.isDown || this.keys.right.isDown) {
            this.stopTrail()
            this.sprite.play('run', true)
        } else {
            this.stopTrail()
            this.sprite.play('idle', true)
        }
    }

    canAct() {
        return !this.isAttacking && !this.isInHitstun
    }

    setDirection(mouse) {
        // transform to unit vector for easier calculations
        const dx = mouse.worldX - this.hurtbox.x
        const dy = mouse.worldY - this.hurtbox.y

        const magnitude = Math.sqrt(dx*dx + dy*dy)

        if (magnitude === 0) return

        this.direction.x = dx / magnitude
        this.direction.y = dy / magnitude
    }

    setVelocity({ x, y }) {
        if (x !== undefined) this.hurtbox.body.setVelocityX(x)
        if (y !== undefined) this.hurtbox.body.setVelocityY(y)
    }

    startTrail() {
        if (this.trailTimer) return
        this.trailTimer = this.scene.time.addEvent({
            delay: 60,
            callback: this._spawnGhost,
            callbackScope: this,
            loop: true
        })
    }

    stopTrail() {
        if (this.trailTimer) {
            this.trailTimer.remove()
            this.trailTimer = null
        }
    }

    _spawnGhost() {
        // Capture exact frame the dash anim is currently showing
        const frameIndex = this.sprite.anims.currentFrame
            ? this.sprite.anims.currentFrame.index
            : this.sprite.frame.name

        const ghost = this.scene.add.sprite(
            this.sprite.x,
            this.sprite.y,
            'biker'
        )
        ghost.setDisplaySize(this.hurtbox.width*3.5, this.hurtbox.height*1.5)
        ghost.setFlipX(this.sprite.flipX)
        ghost.setDepth(this.sprite.depth - 1)

        // Play gradient anim but freeze it on the same frame as the dash sprite
        ghost.play('gradient')
        ghost.anims.pause()
        // Find the matching gradient frame offset (gradient starts at frame 24)
        ghost.setFrame(24 + frameIndex)

        // Fade & destroy after 500ms
        this.scene.tweens.add({
            targets: ghost,
            alpha: 0,
            duration: 1000,
            onComplete: () => ghost.destroy()
        })
    }

    resetStats() {
        this.currentCombo = 0
        this.lastHitTime = 0
        this.direction = { x: 0, y: 0 }
        if(this.hitbox != null) this.hitbox.destroy()
        this.hitbox = null
        this.isAttacking = false
        this.isInHitstun = false
        this.attackStatus = "NONE"
        this.hasAttacked = false
        this.setVelocity({ x: 0, y: 0})
    }
}