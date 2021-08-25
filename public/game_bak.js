const ball = document.querySelector('.ball')

const brect = ball.getBoundingClientRect()
console.log(brect)

// const container = document.querySelector('.container')
const crect = container.getBoundingClientRect()

let scorea = 0, scoreb = 0 
// let pos = 0
// ball.style.left = pos + 'px'

// let pos = parseInt(ball.style.top, 10)
let pos = Math.random()*400 //brect.left - crect.left
// const ylim = container.getBoundingClientRect()
let request
let v = 5
const performAnimation = () => {
  request = requestAnimationFrame(performAnimation)

  // playerList.forEach((player) => {
  //   console.log(player.getBoundingClientRect())
  // })

  playerList.forEach((p, idx) => {
    // console.log(p)    
    const pX = idx%2? 100 : 900
    p.style.left = pX + "px"
    const ball = document.querySelector('.ball')
    const brect = ball.getBoundingClientRect()

    const prect = p.getBoundingClientRect()
    // console.log(prect.left, prect.right, brect.left, brect.right)

if(1)
    if ((prect.top < brect.top + 100) && (prect.top > brect.top - 100)) {
      if (Math.hypot(brect.right - prect.left) < 5) {
        // console.log('hit1a')
        v = -v
      }
      if (Math.hypot(prect.right - brect.left) < 5) {
        // console.log('hit1b')
        v = -v
      }
      if (prect.right > brect.left) {
        // console.log('hit2')
        // v = -v
      }
      // const d = Math.hypot(prect.x - brect.x, prect.y - brect.y)
      // if (d < 60) {
      //   v = -v
      // }
    }

    // console.log('pos', pos, crect.left, crect.right, brect.left, brect.right, prect.left, prect.right)

  })

  pos += v 
  // console.log('pos', pos, 'v', v, 'crect', crect.left, crect.right, 'brect', brect.left, brect.right)
  ball.style.left = pos + 'px'

  if (pos > 900) {
    console.log('hit3')
    scorea+=1
    updateSore(scorea, scoreb)
    v = -v
  }

  // if (pos < crect.left) {
  if (pos < 0) {
    console.log('hit4')
    scoreb+=1
    updateSore(scorea, scoreb)
    v = -v
    // pos = crect.left + 22
  }

}

requestAnimationFrame(performAnimation)

cancelAnimationFrame(request)

function updateScore(a,b) {
  const score = document.querySelector("#score")
  score.innerHTML = scorea + ' | ' + scoreb
}
