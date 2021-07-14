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
      ShowModal: false,
      symbol:'',
      decimals:0,
      detectNewToken:false
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
    ShowModal: false,
    symbol:'',
    decimals:0,
    address:'',
    detectNewToken:false
  })

  // new function
  typeHeadHandler = async (address) => {
    if(isAddress(address)){
      await this.fetchNewToken(address)
    }
  }

  // new function
  fetchNewToken = async (address) => {
    try{
      const {
        symbol,
        decimals
      } = await getTokenSymbolAndDecimals(address, this.props.web3)

      this.setState({
        symbol,
        decimals,
        address,
        detectNewToken:true
      })
    }
    catch(e){
      alert("No standard token")
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
      >
      <Modal.Header closeButton>
        <Modal.Title>
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
          <br/>
            {
              this.state.detectNewToken
              ?
              (
                <Button variant="primary" onClick={() => alert("Done")}>
                  Import {this.state.symbol} to list
                </Button>
              )
              : null
            }
            <br/>
            <br/>
            <Typeahead
              labelKey="sendTokens"
              multiple={false}
              id="sendTokens"
              options={this.props.symbols}
              onChange={(s) => this.changeByClick("Send", s[0])}
              onInputChange={async (s) => this.typeHeadHandler(s)}
              placeholder="Type symbol or paste address"
              renderMenuItemChildren={(options, props) => (
                <div>
                  <img style={{height: "35px", width: "35px"}}src={`https://tokens.1inch.exchange/${this.getTokenAddressBySymbol(options)}.png`} alt="Logo" />
                  &nbsp; &nbsp;
                  {options}
                </div>
              )}
            />
            <br/>

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
