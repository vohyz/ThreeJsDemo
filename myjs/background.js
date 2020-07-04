import Sprite from '../base/sprite'
import DataBus    from '../databus'
let databus = new DataBus()
const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight

const BG_IMG_SRC   = 'images/bg.jpg'
const BG_WIDTH     = 512
const BG_HEIGHT    = 512
const alpha = Math.PI* 126.8/ 360

/**
 * 游戏背景类
 */
export default class BackGround{
  constructor(ctx) {
    if(databus.gameMode === 1) {
      super(BG_IMG_SRC, BG_WIDTH, BG_HEIGHT)
      this.xbegin = 0
      this.ybegin = 0
      this.xpend = 0
      this.ypend = 0
      this.top = 0
    } else {
      super('images/bg2.png', 993, 1360)
      this.c = new Image()
      this.c.src = 'images/crach.png'
      this.xbegin = 0
      this.ybegin = 0
      this.xpend = screenHeight*this.width/this.height
      this.ypend = screenHeight*475/750
      this.top = -(this.xpend - screenWidth)/Math.tan(alpha)
      this.ctop = -(this.xpend*2 - screenWidth)/Math.tan(alpha) - screenHeight*100/750
      this.cright = 0
    }
    
    this.right = 0
    this.render(ctx)
  }
  /**
   * 每帧移动函数(屏高的1/2的1/5再除以移动所需帧数)
   */
  update(length) {
    if(databus.gameMode === 1) {
      this.top += screenHeight * 0.5 / 5 / length
    } else {
      let l = databus.transY(screenHeight * 0.5 / 5 / length)
      this.top += l[1]
      this.right += -l[0]
      this.ctop += l[1]
      this.cright += -l[0]
    }

    if(this.right >= this.xpend) {
      
      this.right -= this.xpend
      this.top -= this.xpend/Math.tan(alpha)
    }
    if(this.cright >= this.xpend*2) {
      this.cright -= this.xpend*2
      this.ctop -= this.xpend*2/Math.tan(alpha)
    }
  }

  /**
   * 背景图重绘函数
   * 绘制两张图片，两张图片大小和屏幕一致
   * 第一张漏出高度为top部分，其余的隐藏在屏幕上面
   * 第二张补全除了top高度之外的部分，其余的隐藏在屏幕下面
   */
  render(ctx) {
    ctx.fillStyle = "rgb(225,206,216)"
    ctx.fillRect(0, 0, screenWidth, screenHeight/2)
    ctx.fillStyle = "rgb(155,163,179)"
    ctx.fillRect(0, screenHeight/2, screenWidth, screenHeight/2)
    ctx.drawImage(
      this.img,
      0,
      0,
      this.width,
      this.height,
      this.xpend - this.right,
      -screenHeight + this.top + this.ypend,
      screenHeight*this.width/this.height,
      screenHeight
    )
    ctx.drawImage(
      this.c,
      this.xpend*2 - this.cright,
      (-screenHeight + this.ypend)*2 + this.ctop,
      screenHeight*2*this.width/this.height,
      screenHeight*this.c.height*2*this.width/this.c.width/this.height
    )

    ctx.drawImage(
      this.img,
      0,
      0,
      this.width,
      this.height,
      -this.right,
      this.top,
      screenHeight*this.width/this.height,
      screenHeight
    )
    ctx.drawImage(
      this.c,
      -this.cright,
      this.ctop,
      screenHeight*2*this.width/this.height,
      screenHeight*this.c.height*2*this.width/this.c.width/this.height
    )
  }
}