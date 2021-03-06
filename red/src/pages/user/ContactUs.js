import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import Header from '../../components/common/Header'
import { ASSET_USER } from '../../assets/static'
import { hideChatButton } from '../../utils/common'
import './ContactUs.scss'

@inject('userStore')
@inject('localeStore')
@observer
class ContactUs extends Component {
  componentDidMount() {
    this.createIframe()
  }

  componentWillUnmount() {
    hideChatButton()
  }

  createIframe = () => {
    let script = document.createElement('script')
    script.type = 'text/javascript'
    // script.defer = true
    script.id = 'ze-snippet'
    script.src =
      'https://static.zdassets.com/ekr/snippet.js?key=46514fb7-9da7-4496-b5c3-d942215d5215'
    // 'https://static.zdassets.com/ekr/snippet.js?key=1975a6f5-96b0-4b28-82c3-a4b866f40f3c'
    // 'https://static.zdassets.com/ekr/snippet.js?key=bf6b0047-ef50-4074-81eb-6632427bb4ef'
    // 'https://static.zdassets.com/ekr/snippet.js?key=3abd36b7-3c9c-408f-ab7e-0b54e85bd08c'
    document.body.appendChild(script)
  }

  render() {
    const {
      history,
      localeStore: {
        locale: { CONTACT_US }
      }
    } = this.props

    return (
      <div id="contact-us">
        <Header onHandle={() => history.push('/user-center')} />
        <div className="chat-wrapper">
          <img src={ASSET_USER.CONTACT_US_IMG} alt="" />
          <p>
            {CONTACT_US.CLICK_TO_CONTACT}
            <br />
            {CONTACT_US.AT_ONCE_CONTACT}
            <br />
            {CONTACT_US.WAIT_FOR_IMG_SHOW}
          </p>
        </div>
        <div className="arrow-box">
          <img src={ASSET_USER.CONTACT_US_ARROW} alt="" />
        </div>
      </div>
    )
  }
}

export default ContactUs
