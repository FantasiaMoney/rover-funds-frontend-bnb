// For fully-onchain based funds

import React, { Component } from 'react'

import {
  SmartFundABIV7,
  ERC20ABI,
  APIEnpoint
} from '../../../config.js'
import { Button, Form, Alert } from "react-bootstrap"
import setPending from '../../../utils/setPending'
import {
  toWeiByDecimalsInput,
  fromWeiByDecimalsInput
} from '../../../utils/weiByDecimals'
import axios from 'axios'


class DepositERC20 extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      Show: false,
      Agree: false,
      DepositValue:0,
      ValueError: false,
      ercAssetContract:null,
      userWalletBalance:'0',
      requireApprove:true
    }
  }

  componentDidUpdate = async (prevProps, prevState) => {
    if(prevState.DepositValue !== this.state.DepositValue){
      await this.updateERC20DepositInfo()
    }
  }

  updateERC20DepositInfo = async() => {
    console.log("Rin updateERC20DepositInfo", this.props.mainAsset)
    if(this.props.mainAsset !== 'BNB'){
      const contract = new this.props.web3.eth.Contract(SmartFundABIV7, this.props.address)
      const ercAssetAddress = await contract.methods.coreFundAsset().call()
      const ercAssetContract = new this.props.web3.eth.Contract(ERC20ABI, ercAssetAddress)
      console.log("ercAssetAddress", ercAssetAddress)

      this.setState({
        ercAssetAddress,
        ercAssetContract
      })
    }
  }

  unlockERC20 = async () => {
    try{
      // get cur tx count
      let txCount = await axios.get(APIEnpoint + 'api/user-pending-count/' + this.props.accounts[0])
      txCount = txCount.data.result

      let block = await this.props.web3.eth.getBlockNumber()

      // Approve max ERC to smart fund
      this.state.ercAssetContract.methods.approve(
        this.props.address,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      )
      .send({ from: this.props.accounts[0]})
      .on('transactionHash', (hash) => {
      // pending status for spiner
      this.props.pending(true, txCount+1)
      // pending status for DB
      setPending(this.props.address, 1, this.props.accounts[0], block, hash, "Deposit")
      })
    }
    catch(e){
    alert("Can not verify transaction data, please try again in a minute")
    console.log("err: ",e)
    }
  }


  depositERC20 = async (_value) => {
    try{
      const ercAssetDecimals = await this.state.ercAssetContract.methods.decimals().call()
      const userWalletBalance = await this.state.ercAssetContract.methods.balanceOf(
        this.props.accounts[0]
      ).call()

      // check if enough balance
      if(parseFloat(fromWeiByDecimalsInput(ercAssetDecimals, String(userWalletBalance))) >= _value){
        const fundERC20 = new this.props.web3.eth.Contract(SmartFundABIV7, this.props.addres)

        const amount = toWeiByDecimalsInput(ercAssetDecimals, _value)
        // get cur tx count
        let txCount = await axios.get(APIEnpoint + 'api/user-pending-count/' + this.props.accounts[0])
        txCount = txCount.data.result

        let block = await this.props.web3.eth.getBlockNumber()

        // Deposit ERC20
        fundERC20.methods.deposit(amount)
        .send({ from: this.props.accounts[0]})
        .on('transactionHash', (hash) => {
        // pending status for spiner
        this.props.pending(true, txCount+1)
        // pending status for DB
        setPending(this.props.address, 1, this.props.accounts[0], block, hash, "Deposit")
        })

        this.modalClose()
      }else{
        alert('Not enough balance for deposit')
      }
    }
    catch(e){
    alert("Can not verify transaction data, please try again in a minute")
    console.log("err: ",e)
    }
 }

 modalClose = () => this.setState({ Show: false, Agree: false });

 render() {
    return (
      <Form>
      <Form.Group>
      <Form.Label>Amount of {this.props.mainAsset}</Form.Label>
      <Form.Control
      type="number"
      min="0"
      placeholder="Amount"
      name="DepositValue"
      onChange={e => this.setState({ DepositValue:e.target.value })}
      />
      {
        this.state.ValueError ? (
          <Alert variant="danger">Value can't be 0 or less</Alert>
        ) : (null)
      }
      </Form.Group>

      {
        this.state.requireApprove
        ?
        (
          <Button
            variant="outline-primary"
            type="button"
            onClick={() => this.unlockERC20()}
          >
          Unlock
          </Button>
        )
        :
        (
          <Button
            variant="outline-primary"
            type="button"
            onClick={() => this.depositERC20(this.state.DepositValue)}
          >
          Deposit
          </Button>
        )
      }
      </Form>
    )
  }
}

export default DepositERC20
