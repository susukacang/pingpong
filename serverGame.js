const ball = document.querySelector('.ball')
const brect = ball.getBoundingClientRect()

const crect = container.getBoundingClientRect()

let scorea = 0, scoreb = 0 

// let pos = Math.random()*400 //brect.left - crect.left
let posx = brect.x
let posy = brect.y
let request
let vx = 5
let vy = 5

const performAnimation = () => {
  request = requestAnimationFrame(performAnimation)

  playerList.forEach((p, idx) => {
    const pX = idx%2? 100 : 900
    p.style.left = pX + "px"
    const ball = document.querySelector('.ball')
    const brect = ball.getBoundingClientRect()

    const prect = p.getBoundingClientRect()
    // console.log(prect.left, prect.right, brect.left, brect.right)

    if ((prect.top < brect.top + 100) && (prect.top > brect.top - 100)) {
      if (Math.hypot(brect.right - prect.left) < 5) {
        vx = -vx
      }
      if (Math.hypot(prect.right - brect.left) < 5) {
        vx = -vx
      }
    }
  })

  posx += vx 
  posy += vy 
  // console.log('posx', posx, 'v', v, 'crect', crect.left, crect.right, 'brect', brect.left, brect.right)
  ball.style.left = posx + 'px'
  ball.style.top = posy + 'px'

  if (Math.hypot(posx - (crect.right - crect.left) + 100) < 5 ) {
    scoreb+=1
    updateScore(scorea, scoreb)
    vx = -vx
  }

  if (Math.hypot(posx - 0 ) < 5) {
    scorea+=1
    updateScore(scorea, scoreb)
    vx = -vx
  }

  if (Math.hypot(posy - (crect.bottom - crect.top) + 100) < 5 ) {
    vy = -vy
  }

  if (Math.hypot(posy - 0 ) < 5) {
    vy = -vy
  }

}

requestAnimationFrame(performAnimation)

cancelAnimationFrame(request)

function updateScore(a,b) {
  const score = document.querySelector("#score")
  score.innerHTML = scorea + ' | ' + scoreb
}

function stopGame() {
  if (request) cancelAnimationFrame(request)
}

function startGame() {
  console.log('...startGame')
  requestAnimationFrame(performAnimation)
}

