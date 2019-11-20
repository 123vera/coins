import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Toast, Button } from 'antd-mobile'
import { UserApi, PersonApi } from '../../api'
import {
  COIN_POINT_LENGTH,
  COUNT_DOWN,
  USDT_POINT_LENGTH
} from '../../utils/constants'
import { isMobile } from '../../utils/reg'
import { formatCoinPrice } from '../../utils/format'
import { getImagePath } from '../../utils/file'
import Header from '../../components/common/Header'
import scanIcon from '../../assets/images/scan.svg'
// import recordIcon from '../../assets/images/record.png'
import Captcha from '../../components/common/Captcha'
import './Withdraw.scss'

@inject('walletStore')
@inject('personStore')
@inject('userStore')
@observer
class Withdraw extends Component {
  state = {
    code: '',
    amount: '',
    walletTo: '',
    type: '',
    imgSrc: '',
    captcha: '',
    captchaKey: +new Date(),
    count: COUNT_DOWN,
    isCountDown: false,
    isSubmit: false,
    newServiceCharge: '' // 根据地址获取的手续费
  }

  componentDidMount() {
    const { match, walletStore, personStore } = this.props
    const { type } = match.params
    this.setState({ type })
    walletStore.withdrawInit({ type })
    personStore.getUserInfo()
    this.getCaptchaPng()
  }

  componentWillUnmount() {
    clearTimeout(this.linkTimer)
    clearTimeout(this.timer)
  }

  getCaptchaPng = () => {
    const key = +new Date()

    UserApi.getCaptchaPng({ key }).then(res => {
      this.setState({ captchaKey: key, imgSrc: res })
    })
  }

  onInputChange = (e, key) => {
    const { value } = e.target
    this.setState({ [key]: value })
  }

  onAmountChange = e => {
    const { value } = e.target
    const reg = /^\d+(\.)?\d{0,4}?$/
    if (value && !reg.test(e.target.value)) {
      return
    }
    this.setState({ amount: value })
  }

  onAddressBlur = e => {
    const { value } = e.target
    const { type } = this.state
    if (!value) return
    PersonApi.serviceCharge({ address: value, type }).then(res => {
      if (res.status !== 1) {
        Toast.info(res.msg)
        return
      }
      this.setState({ newServiceCharge: res.data.serviceCharge })
      // this.setState({newServiceCharge: 0})
    })
  }

  onChangeFile = e => {
    const { files } = e.target
    if (!files) return

    getImagePath(files[0], url => {
      window.qrcode.decode(url)
      window.qrcode.callback = msg => {
        if (msg === 'error decoding QR Code') {
          Toast.info('识别失败')
          return
        }
        this.setState({ walletTo: msg })
      }
    })
  }

  onCountDown = () => {
    let { count } = this.state
    this.timer = setTimeout(() => {
      if (count <= 0) {
        this.setState({ isCountDown: false, count: COUNT_DOWN })
        clearTimeout(this.timer)
      } else {
        this.setState({ count: --count })
        this.onCountDown()
      }
    }, 1000)
  }

  getCode = () => {
    const {
      personStore: { userName },
      userStore
    } = this.props
    const { captcha, captchaKey } = this.state
    userStore
      .getCode(
        {
          captcha,
          account: userName,
          type: 'withdraw'
        },
        { key: captchaKey }
      )
      .then(res => {
        if (res.status !== 1) {
          Toast.info(res.msg)
          this.getCaptchaPng()
          return
        }
        this.setState({ isCountDown: true, count: COUNT_DOWN })
        this.onCountDown()
      })
  }

  onSubmit = () => {
    const { history, walletStore } = this.props
    let { code, amount, walletTo, type } = this.state
    const { amountMin, amountMax, balance } = walletStore.withdrawInfo

    amount = Number(amount)
    if (!walletTo) {
      Toast.info('请填写提币地址')
      return
    }
    if (type === 'USDT' && !/^(1|3)[a-zA-Z\d]{24,33}$/.test(walletTo)) {
      Toast.info('地址格式错误')
      return
    }
    if (type !== 'USDT' && !/^(0x)?[0-9a-fA-F]{40}$/.test(walletTo)) {
      Toast.info('地址格式错误')
      return
    }
    if (!amount) {
      Toast.info('请输入提币数量')
      return
    }
    if (amount < amountMin) {
      Toast.info('低于最小提币数量')
      return
    }
    if (amount > amountMax) {
      Toast.info('提币量超过限制')
      return
    }
    if (amount > balance) {
      Toast.info('账户不足')
      return
    }

    this.setState({ isSubmit: true })
    walletStore
      .withdraw({
        walletTo,
        code,
        amount,
        type
      })
      .then(res => {
        this.setState({ isSubmit: false })
        if (res.status !== 1) {
          Toast.info(res.msg)
          return
        }
        Toast.info('提现成功，正在跳转提币记录页')
        this.linkTimer = setTimeout(() => {
          history.push('/wallet/withdraw-record/' + type)
        }, 2000)
      })
      .catch(() => this.setState({ isSubmit: false }))
  }

  render() {
    const {
      history,
      walletStore,
      personStore: { userName }
    } = this.props

    const {
      code,
      amount,
      walletTo,
      type,
      imgSrc,
      captcha,
      count,
      isCountDown,
      isSubmit,
      newServiceCharge
    } = this.state
    const {
      dayMax,
      amountMin,
      amountMax,
      balance,
      serviceChargeIn,
      serviceChargeOut
    } = walletStore.withdrawInfo || {}

    const displayServiceCharge =
      newServiceCharge === 0 ? 0 : newServiceCharge || serviceChargeOut
    const canSubmit = walletTo && amount && code
    const realAmount = amount
      ? Number(amount) - Number(amount) * Number(displayServiceCharge)
      : '--'

    return (
      <div id="withdraw">
        <Header title={type + '提币'} bgPrimary isFixed isShadow>
          <span onClick={() => history.push('/wallet/withdraw-record/' + type)}>
            提币记录
          </span>
        </Header>
        <section className="section-form">
          <div className="row">
            <span className="balance">
              可用：
              {formatCoinPrice(
                balance,
                type === 'USDT' ? USDT_POINT_LENGTH : COIN_POINT_LENGTH
              )}
            </span>
          </div>
          <div className="row">
            <label>提币地址</label>
            <div className="input-box">
              <input
                type="text"
                placeholder="输入或长按粘贴地址"
                value={walletTo}
                onChange={e => this.onInputChange(e, 'walletTo')}
                onBlur={this.onAddressBlur}
              />
              <div className="file-btn">
                <input type="file" onChange={this.onChangeFile} />
                <button>
                  <img src={scanIcon} alt="扫码" />
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <label>数量（{type}）</label>
            <div className="input-box">
              <input
                type="text"
                placeholder={'最小提币量' + amountMin}
                value={amount}
                onChange={this.onAmountChange}
              />
            </div>
            <small>手续费：{(displayServiceCharge || 0) * 100}%</small>
          </div>
          <div className="row">
            <label>图形验证码</label>
            <Captcha
              imgSrc={imgSrc}
              value={captcha}
              onChange={e => this.onInputChange(e, 'captcha')}
              getCaptchaPng={this.getCaptchaPng}
            />
          </div>
          <div className="row">
            <label>{isMobile(userName) ? '手机验证码' : '邮箱验证码'}</label>
            <div className="input-box">
              <input
                type="text"
                placeholder="请输入验证码"
                value={code}
                onChange={e => this.onInputChange(e, 'code')}
              />
              <button
                className={isCountDown ? 'count-down' : ''}
                onClick={this.getCode}
              >
                {isCountDown ? `${count}S` : '获取验证码'}
              </button>
            </div>
          </div>
          <div className="row">
            <label>
              <span>到账数量</span>
              <span>
                {formatCoinPrice(
                  realAmount,
                  type === 'USDT' ? USDT_POINT_LENGTH : COIN_POINT_LENGTH
                )}
              </span>
            </label>
          </div>
          <div className="btn-box">
            <Button
              activeClassName="active"
              className="primary-button"
              disabled={!canSubmit || isSubmit}
              onClick={this.onSubmit}
            >
              提现
            </Button>
          </div>
        </section>
        <section className="section-aside">
          <p>友情提示</p>
          <p>
            {' '}
            • 当前，每人每日最高可提现 {dayMax} {type}， 单笔转出限额为
            {amountMin} - {amountMax} {type}， 提币手续费{' '}
            {(serviceChargeOut || 0) * 100}%。 转账手续费{' '}
            {(serviceChargeIn || 0) * 100}%。
          </p>
          <p> • 为了保障资金安全，我们会对提币进行人工审核，请耐心等待。</p>
          <p>
            • ⻩金用户提币需要满⾜以下相关条件:平台中保留留⾄至少200xc，不限状态
          </p>
        </section>
      </div>
    )
  }
}

export default Withdraw
