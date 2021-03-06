import React, {Component} from 'react'
import './VeritifiedPwd.scss'
import openPwdImg from '../../assets/images/open-pwd.png'
import closePwdImg from '../../assets/images/close-pwd.png'
import AccountHeader from './AccountHeader'
import Button from 'antd-mobile/es/button'
import {inject, observer} from "mobx-react";

@inject('localeStore')
@observer
class VerifiedPwd extends Component {
  state = {
    pwType: 'password',
    pwConfirmType: 'password'
  }

  onSetType = (currentType, key) => {
    const type = currentType === 'password' ? 'text' : 'password'
    this.setState({[key]: type})
  }

  render() {
    const {localeStore} = this.props
    const {PASSWORD, COMMON} = localeStore.language || {}

    const {
      show,
      password,
      passwordConfirm,
      onInputChange,
      onSubmit,
      onStepChange,
      typeOption
    } = this.props
    const {pwType, pwConfirmType} = this.state
    const canSubmit = password !== '' && passwordConfirm !== ''

    return (
      <div className={'verified-pwd ' + (show ? 'show' : '')}>
        <AccountHeader
          title={typeOption.type === 'pay' ? PASSWORD.SET_PASSWORD : PASSWORD.RESET_PASSWORD}
          msg={PASSWORD.PASSWORD_REMARK}
          onHandle={() => onStepChange(1)}
        />
        <div className="main-content">
          <label>
            <input
              className="input-main"
              type={pwType}
              placeholder={COMMON.PASSWORD_PLACEHOLDER}
              value={password}
              onChange={e => onInputChange(e, 'password')}
            />
            <img
              src={pwType === 'text' ? openPwdImg : closePwdImg}
              alt=""
              onClick={() => this.onSetType(pwConfirmType, 'pwType')}
            />
          </label>
          <label>
            <input
              className="input-main"
              type={pwConfirmType}
              placeholder={COMMON.PASSWORD_CONFIRM_PLACEHOLDER}
              value={passwordConfirm}
              onChange={e => onInputChange(e, 'passwordConfirm')}
            />
            <img
              className="eye-img"
              src={pwConfirmType === 'text' ? openPwdImg : closePwdImg}
              alt="睁眼闭眼"
              onClick={() => this.onSetType(pwConfirmType, 'pwConfirmType')}
            />
          </label>
        </div>
        <Button
          activeClassName="btn-common__active"
          className={`btn-common ${!canSubmit ? 'btn-common__disabled' : ''}`}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {typeOption.type === 'pay' ? COMMON.SET : COMMON.RESET}
        </Button>
      </div>
    )
  }
}

export default VerifiedPwd
