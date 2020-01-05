radio.setGroup(1)

let buttons: number = 0
let lastRadioTime: number = 0
let velocity: number = 0
let m1 = maqueen.Dir.CW
let m2 = maqueen.Dir.CCW

radio.onReceivedNumber(function (v: number) {
    control.inBackground(function () {
        led.plot(2, 1)
        basic.pause(100)
        led.unplot(2, 1)
    })
    lastRadioTime = input.runningTime()
    showPressed(v)
    buttons = v

    if (v & 0x30) {
        velocity = 255
    }
    if (v & 0x20) {
        m1 = maqueen.Dir.CCW
        m2 = maqueen.Dir.CW
    } else {
        m1 = maqueen.Dir.CW
        m2 = maqueen.Dir.CCW
    }
    if (v & 0x04) {
        velocity = 255
    }
    if (v & 0x08) {
        velocity = 0
    }
})

basic.forever(function () {
    let now = input.runningTime()
    let delta = now - lastRadioTime
    if ((buttons > 0 && delta > 2000) || (delta > 6000)) {
        buttons = 0
        velocity = 0
        basic.clearScreen()
    }
    basic.pause(1000)
})

basic.forever(function () {
    if (velocity == 0) {
        maqueen.motorStop(maqueen.Motors.All)
        return
    }

    // avoid wall
    let minDistance = 35
    let distance = maqueen.Ultrasonic(PingUnit.Centimeters)
    if (buttons == 0 && distance < minDistance && distance > 0
        && maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1
        && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 1) {
        if (Math.random() < 0.5) {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 0)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 255)
        } else {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 255)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 0)
        }
        basic.pause(800)
        return
    }

    //
    if (buttons || (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 1)) {
        maqueen.motorRun(
            maqueen.Motors.M1,
            buttons & 0x40 ? m2 : m1,
            velocity
        )
        maqueen.motorRun(
            maqueen.Motors.M2,
            buttons & 0x80 ? m2 : m1,
            velocity
        )
        return
    }

    // patrol
    if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 0 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 0) {
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 255)
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 255)
    } else {
        if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 0 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 1) {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 0)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 255)
            if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 1) {
                maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 0)
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 255)
            }
        } else {
            if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 0) {
                maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 255)
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 0)
                if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 1) {
                    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 255)
                    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 0)
                }
                if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 0) {
                    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 255)
                } else {
                    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 0)
                }
            }
        }
    }
})

function showPressed(v: number) {
    if (v & 0x01) { led.plot(1, 0) } else { led.unplot(1, 0) }
    if (v & 0x02) { led.plot(3, 0) } else { led.unplot(3, 0) }

    if (v & 0x04) { led.plot(4, 3) } else { led.unplot(4, 3) }
    if (v & 0x08) { led.plot(4, 4) } else { led.unplot(4, 4) }

    if (v & 0x10) { led.plot(1, 2) } else { led.unplot(1, 2) }
    if (v & 0x20) { led.plot(1, 4) } else { led.unplot(1, 4) }
    if (v & 0x40) { led.plot(0, 3) } else { led.unplot(0, 3) }
    if (v & 0x80) { led.plot(2, 3) } else { led.unplot(2, 3) }
}

