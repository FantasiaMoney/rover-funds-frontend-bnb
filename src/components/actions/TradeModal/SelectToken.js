// Props
// web3
// symbols
// tokens
// push tokens obj

import React, { Component } from 'react'
import {
  Modal,
  Button,
  Form,
  InputGroup
} from "react-bootstrap"

import { Typeahead } from 'react-bootstrap-typeahead'
import getTokenSymbolAndDecimals from '../../../utils/getTokenSymbolAndDecimals'
import { isAddress } from 'web3-utils'


class SelectToken extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      Send: 'BNB',
      ShowModal: false
    }
  }

  // extract address from global tokens obj by symbol
  getTokenAddressBySymbol = (symbol) => {
    const From = this.props.tokens.filter(item => item.symbol === symbol)
    return String(From[0].address).toLowerCase()
  }

  // reset states after close modal
  closeModal = () => this.setState({
    Send: 'BNB',
    ShowModal: false
  })

  // new function
  typeHeadHandler = async (stateName, address) => {
    if(isAddress(address)){
      await this.pushNewToken(stateName, address)
    }
  }

  // new function
  pushNewToken = async (stateName, address) => {
    try{
      const {
        symbol,
        decimals
      } = await getTokenSymbolAndDecimals(address, this.props.web3)

      this.setState({
        [stateName]:symbol
      })
    }
    catch(e){
      console.log("err", e)
    }
  }

  // helper for update state by click
  changeByClick = (name, param) => {
    this.setState({
      [name]:param
    })
  }

  render() {
   return (
      <div>
      <InputGroup className="mb-3">
      <InputGroup.Prepend>
      <InputGroup.Text>

        <Button variant="outline-primary" onClick={() => this.setState({ ShowModal: true })}>
          {this.state.Send}
        </Button>

      </InputGroup.Text>
      </InputGroup.Prepend>
      </InputGroup>

      <Modal
      size="lg"
      show={this.state.ShowModal}
      onHide={() => this.closeModal()}
      aria-labelledby="example-modal-sizes-title-lg"
      >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          Exchange
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {
        this.props.tokens
        ?
        (
          <>
          <Form.Label>Pay with</Form.Label>

            <Typeahead
              labelKey="sendTokens"
              multiple={false}
              id="sendTokens"
              options={this.props.symbols}
              onChange={(s) => this.changeByClick("Send", s[0])}
              onInputChange={async (s) => this.typeHeadHandler("Send", s)}
              placeholder="Type symbol or paste address"
              renderMenuItemChildren={(options, props) => (
                <div>
                  <img style={{height: "35px", width: "35px"}}src={`https://tokens.1inch.exchange/${this.getTokenAddressBySymbol(options)}.png`} alt="Logo" />
                  &nbsp; &nbsp;
                  {options}
                </div>
              )}
            />
          </>
        )
        :
        (
          <p>Load data</p>
        )
      }
      </Modal.Body>
      </Modal>
      </div>
    )
  }
}
export default SelectToken
